import API from "../../../api";
import type {Role, User } from "../../../api";

interface RegisterPayload{
    email:string;
    name:string;
    role:Role;
    password:string
}
interface RegisterResponse{
    success:boolean;
    message:string;
    data:User
}
export const registerUser = async(data:RegisterPayload):Promise<RegisterResponse>=>{
   const response = await API.post("/auth/register",data);
   return response.data;
}

interface RolePayload{
    role:Role
}
interface RoleResponse{
    success:boolean;
    message:string;
    data:{
        id:string;
        role:Role
    }
}
export const selectRole = async(data:RolePayload):Promise<RoleResponse>=>{
    const response = await API.patch("/auth/role",data)
    return response.data;
}