import API from "../../../api";
import type { Service } from "../../Dashboard/api/dashboard.api";


interface ResponseService{
    success:boolean,
    message:string,
    data:Service[]
}

export const getService = async (workerId:string):Promise<ResponseService>=>{
    const res = await API.get(`/api/${workerId}/services`)
    return res.data;
}

export interface Slots{
   
 timeSlotId: number;
 label: string;
 status: string;

}
interface Response{
    success:boolean,
    message:string,
    data:{
        hourly_rate:number,
        slots:Slots[]
    }
}
export const getSlots = async(workerId:string, selectedDate: string):Promise<Response>=>{
    const res = await API.get(`/api/${workerId}/slots`,
        { params:{selectedDate}}
    )
    return res.data;
}

interface SuccessResponse {
    success:boolean;
    message:string;
    data:BookingResponse
}
export interface BookingResponse {
  booking_Id: number;
  status: string;
  total_amount: number;
  worker_status:string;
}

interface DataInput{

workerId:string ,
 bookingDate:string , 
 timeSlotId :number , 
 serviceIds:string[]
  description:string
}
export const createBooking = async (data:DataInput):Promise<SuccessResponse>=>{
  const res = await API.post(`/api/book/request`,data)
  return res.data;
}

export interface FetchData{
id:string;
customer_name ?:string;
worker_name?:string;
customer_id:string;
worker_id:string;
booking_date:Date;
start_time:string;
end_time:string;
status:string;
total_amount:number;
description:string;
created_at:string;
time_slot_id:string;
rejection_reason:string;
}
interface FetchResponse{
    success:boolean
    message:string,
    data:FetchData[]
}

export const getBookRequest = async():Promise<FetchResponse>=>{
    const res = await API.get("/api/book/request");
    return res.data;
}
interface AcceptResponse{
    success:boolean,
    message:string,
    data:{
        booking_id:string;
        total_amount:string
    }
}

export const acceptRequest = async(bookingId:string):Promise<AcceptResponse>=>{
     const res = await API.post(`/api/book/request/accept/${bookingId}`);
    return res.data;
}


interface MessageResponse{
    success:boolean,
    message:string,

}

export const rejectRequest = async(bookingId:string,reason:string):Promise<MessageResponse>=>{
     const res = await API.patch(`/api/book/request/reject/${bookingId}`,{
        reason
     });
    return res.data;
}