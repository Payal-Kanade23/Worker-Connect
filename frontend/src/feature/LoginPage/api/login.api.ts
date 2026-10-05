import type { User } from "../../../api";
import API from "../../../api";

interface LoginPayload{
  
    email:string;
    password:string;
   
}
interface LoginResponse{
    success:boolean;
    message:string;
    data:User
}
export const loginUser = async(data:LoginPayload):Promise<LoginResponse>=>{
   const response = await API.post("/auth/login",data);
   return response.data;
}

interface LogoutResponse{
success:boolean;
    message:string;
    
}
    

export const logoutUser = async():Promise<LogoutResponse>=>{
   const response = await API.post("/auth/logout");
   return response.data;
}