import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { findUserByEmail, findUserById, createLocalUser, createProfileForRole , setUserRole, getCustomerId, getWorkerId} from '../models/User.js';
import type { GoogleUser, User, UserRole } from '../type/types.js';
import { storeRefreshToken, isRefreshTokenValid, revokeRefreshToken } from '../models/RefreshToken.js';
import { ROLES , ROLE_PERMISSIONS } from '../utils/permission.js';
import { logActivity } from '../models/ActivityLogger.js';
import { updateProfile } from '../models/User.js';
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
   maxAge: 15 * 60 * 1000,  // 15 minutes
    path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/auth/refresh', // ← this cookie is only ever sent to this one route
};

function signAccessToken(user: Pick<User, 'id' | 'role' | 'name' | 'email'>): string {
  return jwt.sign({ id: user.id, role: user.role , name:user.name , email:user.email }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: '15m',
  });
}

function signRefreshToken(userId: string): string {
  // A separate secret from the access token — if one leaks, the other stays safe
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  });
}

async function issueTokens(res: Response, user: Pick<User, 'id' | 'role' | 'name'| 'email'>): Promise<void> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await storeRefreshToken(user.id, refreshToken, expiresAt);
  res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
}


export async function register(req:Request,res:Response):Promise<void>{
    try{
        const {name , email , phone , password , role} = req.body;

        const existing = await findUserByEmail(email)
        if(existing){
             res.status(409).json({ error: 'Email already registered' });
             return;
        }

        const passwordHash = await bcrypt.hash(password ,10)

        const user = await createLocalUser({name , email , phone , passwordHash, role});


        await createProfileForRole(user.id , role);

         await issueTokens(res , {id:user.id,role:user.role as ROLES , name:user.name , email:user.email})

          const permissions = ROLE_PERMISSIONS[role  as ROLES];
          console.log(permissions)
        

        res.status(201).json({
            success:true,
            message:"Registration successfull",
            data:{
             id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
            permissions:permissions
            }
           
        })
          logActivity({
                  userId: user?.id ?? null,
                  userEmail: user?.email ?? null,
                  action:"register",
                  entityType:"user",
                  entityId: user.id,
                  description: `${req.method} ${req.originalUrl}`,
                  ipAddress: req.ip,
                  userAgent: req.get('user-agent'),
                  metadata: {
                    params: req.params,
                    query: req.query,
                  },
                });

    }catch(err){
        console.error(err);
    res.status(500).json({ error: 'Registration failed' + err});
  
    }
}


 

export async function login(req:Request, res:Response):Promise<void>{
try{
    const {email , password} = req.body;
    const existing = await findUserByEmail(email)

        if(!existing){
             res.status(409).json({ error: 'User Not Registered' });
             return;
        }

        const match = await bcrypt.compare(password, existing.password_hash!)
        if(!match){
           res.status(409).json({error:"Invalid credential"})
           return;
        }

        await issueTokens(res , {id:existing.id , role: existing.role as ROLES,name:existing.name , email:existing.email  })
                  const permissions = ROLE_PERMISSIONS[existing.role  as ROLES];


                  
      
        res.status(201).json({
            success:true,
            message:"Login successful",
            data:{
             id:existing.id,
            name:existing.name,
            email:existing.email,
            role:existing.role,
            permissions
          
            }
           
        })
          logActivity({
        userId: existing?.id! ?? null,
        userEmail: existing?.email ?? null,
        action:"login",
        entityType:"user",
        entityId: existing.id ,
        description: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          params: req.params,
          query: req.query,
        },
      });




}catch(err){
  console.error(err);
    res.status(500).json({ error: 'Login failed' });
}
} 

export async function logout(req:Request, res:Response):Promise<void>{
  const token = req.cookies.refresh_token;
  if(token){
    try{
      const decoded = jwt.verify(token , process.env.JWT_REFRESH_SECRET as string ) as {id:string}
      await revokeRefreshToken(decoded.id , token)
    }catch{
            // token was already invalid/expired — nothing to revoke

    }
  }
   res.clearCookie('access_token', ACCESS_COOKIE_OPTIONS);
  res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);
  res.json({success:true, message: 'Logged out' });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies.refresh_token;

  if (!token) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }

  try {
    // 1. Verify refresh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    // 2. Check whether refresh token is still valid
    const valid = await isRefreshTokenValid(decoded.id, token);

    if (!valid) {
      res.status(401).json({
        error: "Refresh token revoked or expired",
      });
      return;
    }

    // 3. Find user
    const user = await findUserById(decoded.id);

    if (!user) {
      res.status(401).json({
        error: "User not found",
      });
      return;
    }

    // 4. Create ONLY a new access token
    const accessToken = signAccessToken({
      id: user.id,
      role: user.role ,
      name: user.name,
      email: user.email,
    });

    // 5. Send new access token in cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      message: "Token refreshed",
    });
  } catch {
    res.status(401).json({
      error: "Invalid refresh token",
    });
  }
}

// Called after Google's OAuth flow succeeds — passport attaches the user
// to req.user (see config/passport.js), this just issues our own tokens.
export async function googleCallback(req: Request, res: Response): Promise<void> {

  const user = req.user as GoogleUser;
  await issueTokens(res, { id: user.id, role: user.role, name:user.name , email:user.email });

  if (user.needsRoleSelection) {
    res.redirect(`${process.env.CLIENT_URL}/choose-role`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
}



export async function setRole(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.body as { role: UserRole };
    
    const existing = await findUserById(req.jwtUser!.id);
    if (!existing) { res.status(404).json({ error: 'User not found' }); return; }
    if (existing.role) { res.status(400).json({ error: 'Role already set' }); return; }

    const updated = await setUserRole(req.jwtUser!.id, role);
    await createProfileForRole(updated.id, role);
    await issueTokens(res, updated); // re-issue so the token carries the real role now

    res.json({success:true,message:"Profile role updated", data:{ id: updated.id, role: updated.role} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set role'+err });
  }
}

export const getLoggeduser = async(req:Request,res:Response) =>{
  const { id, role } = req.jwtUser!;

  try{

     const userRes = await findUserById(id);
  if (!userRes) return res.status(404).json({ error: 'User not found' });

  let extra = {};
  if (role === 'customer') {
    const c = await getCustomerId(userRes?.id);
    extra = c || {};
  } else if (role === 'worker') {
    const w = await getWorkerId(userRes.id);
    extra = w || {};

  }
            const permissions = ROLE_PERMISSIONS[role  as ROLES];

  res.json({
    success:true,
    message:"Logged User Details fetched Successfully!",
    data:{...userRes, ...extra ,permissions}
    });

  }catch(error){
        res.status(500).json({ error: 'internal error'+error });

  }

 
}


export async function update_user(req:Request,res:Response):Promise<void>{
    try{
        const data
= req.body;
console.log(data)
        const userId = req.jwtUser?.id;
        const role = req.jwtUser?.role;
        const existing = await findUserById(userId!)
        if(!existing){
             res.status(409).json({ error: 'User not found!' });
             return;
        }


        


        const user = await updateProfile(userId! , role!, data);

  
          const permissions = ROLE_PERMISSIONS[role  as ROLES];
          console.log(permissions)
        

        res.status(201).json({
            success:true,
            message:"Profile Updated successfull",
            data:{
             id:userId,
            name:user.name,
            email:user.email,
            role:user.role,
            permissions:permissions
            }
           
        })
          logActivity({
                  userId: user?.id ?? null,
                  userEmail: user?.email ?? null,
                  action:"register",
                  entityType:"user",
                  entityId: user.id,
                  description: `${req.method} ${req.originalUrl}`,
                  ipAddress: req.ip,
                  userAgent: req.get('user-agent'),
                  metadata: {
                    params: req.params,
                    query: req.query,
                  },
                });

    }catch(err){
        console.error(err);
    res.status(500).json({ error: 'Registration failed' + err});
  
    }
}


