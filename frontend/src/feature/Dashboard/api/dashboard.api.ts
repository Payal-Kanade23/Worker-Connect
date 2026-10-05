import API, { type Role } from "../../../api";
import type { User } from "../../../api";

export interface Service{
  id:string;
  name:string;
}



export interface Worker{
  user_id:string;
  name:string;
  email:string;
  phone:string;
  password_hash:string;
  role:string;
  profile_image:string | null;
  is_active:boolean;
  is_verified:boolean;
  auth_provider:string;
  worker_id:string;
  available_from:string;
  available_to:string;
  employment_type:string;
  hourly_rate:string;
  hour_per_day:number;
  longitude:number;
  latitude:number;
  service_radius_km:number;
  services:Service[]
  created_at:string;
  rating_avg:string


}

export interface WorkerResponse {
  success: boolean;
  message: string;
  data: Worker[];
}

export const get_worker = async():Promise<WorkerResponse> =>{
    const res = await API.get("/api/workers");
    return res.data;
} 
export interface WorkerResponseEach{
  success: boolean;
  message: string;
  data: Worker;
}

export const get_one_worker = async(userId:string):Promise<WorkerResponseEach>=>{
   const res = await API.get(`/api/workers/${userId}`);
    return res.data;
}