import API from "../../../api";

export interface editData{
    name: string,
    phone: string,
    default_address?: string,
    latitude?: number,
    longitude?: number,

    employment_type?: string,
    hourly_rate?: number,
    hour_per_day?: number,
    available_from?: string,
    available_to?: string,
    service_radius_km?: number
}

interface EditResponse{
success:boolean;
message:string;
data:{
    id:number,
    name:string,
    role:string,
}
}
export const editProfile = async(data:editData):Promise<EditResponse>=>{
     const res = await API.put("/auth/profile", data);
     return res.data;
     
}