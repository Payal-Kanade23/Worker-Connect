import { ROLES } from "../utils/permission.js";

export type UserRole = 'admin' | 'worker' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string | null; // null for Google-only accounts
  auth_provider: 'local' | 'google';
  role: ROLES // null until a fresh Google user picks one
  is_active: boolean;
  created_at: Date;
}

export interface Worker{
  id:string;
  user_id:User;
  employment_type:'part_time'|'full_time';
  hour_per_day:number|null;
  hourly_rate:number|null;
  latitude:number|null;
  longitude:number|null;
  service_radius_km:number;
  available_from:string;
  available_to:string;
  rating_avg:number;
  is_Verified:boolean;
}

export interface worker_service{
  worker_id:string;
  service_type_id:string;

}

export interface service_type{
  id:string;
  name:string;
  description:string;
}

export interface RefreshTokenRow{
   id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

export interface GoogleUser extends User {
  needsRoleSelection?: boolean;
}

// What we encode into the JWT — deliberately smaller than the full User
export interface JwtPayload {
  id: string;
  role: UserRole ;
  name : string;
  email : string;
}



declare global {
  namespace Express {
    interface User extends GoogleUser {} // tells Passport's own User type to BE your GoogleUser
    interface Request {
      jwtUser?: JwtPayload; // your JWT-based property stays separate — no conflict now
    }
  }
}