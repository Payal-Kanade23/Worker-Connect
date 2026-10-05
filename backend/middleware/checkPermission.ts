import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from "../utils/permission.js";
import { Request,Response,NextFunction } from "express";
export const checkPermission = (permission:PERMISSIONS)=>{
    return(req:Request , res:Response , next:NextFunction) =>{
        const role = req.jwtUser?.role;
        console.log("role------",req.user)

        if(!role){
            return res.status(401).json({
                message:"Unauthorized",
            })
        }

        const permissions = ROLE_PERMISSIONS[role];

        if(!permissions?.includes(permission)){
            return res.status(403).json({
                message:"Forbidden",
            })
        }
        next()
    }
}

export default checkPermission;
