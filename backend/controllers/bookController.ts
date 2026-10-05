import { Request, Response } from "express";
import { addRequest, findBookRequestByBId, findRequestByCustomer, findRequestForWorker, setAcceptRequest, setRejectRequest } from "../models/Book.js";
import { findUserById, getCustomerId, getWorkerId } from "../models/User.js";


export const bookRequest = async(req:Request, res:Response) =>{
  try{

  const currentUser = req.jwtUser?.id;  
  const {workerId , bookingDate , timeSlotId , serviceIds ,description} = req.body;
  console.log(currentUser)
  const result = await addRequest(currentUser!, workerId, bookingDate , timeSlotId, serviceIds ,description);
  return res.status(201).json({
    success:true,
    message:"request sent successfully",
    data:{
      booking_id:result.booking.id,
      status:result.booking.status,
      total_amount:result.booking.total_amount,
      worker_status:result.workerStatus

    }
    
  })
  }catch(error:any){
    console.log("error:",error.message)
    res.status(500).json({
      success:false,
      message:error.message
    });

  }
}

export const acceptRequest = async(req:Request, res:Response)=>{
  const currentUser = req.jwtUser?.id;
  const bookingId = req.params.bookingId as string;
  try{
  const result = await setAcceptRequest(bookingId,currentUser!);
  console.log("resut:",result);

  return res.status(201).json({
    success:true,
    message:"request accepted successfully",
    data:{
      bookingId,
      status:result.status,
      total_amount:result.total_amount

    }
  })
}catch(error:any){
    res.status(500).json({
      message:"Internal error "+error.stack
    });
  }
}


export const rejectRequest = async(req:Request, res:Response)=>{
  const currentUser = req.jwtUser?.id;

  const bookingId = req.params.bookingId as string;
  const reason = req.body.reason ;
  try{
  const result = await setRejectRequest(bookingId,reason);
  console.log("resut:",result);

  return res.status(201).json({
    success:true,
    message:"request rejected successfully",
    data:{
      bookingId,
      status:result.status,
      total_amount:result.total_amount

    }
  })
}catch(error:any){
    res.status(500).json({
      message:"Internal error "+error.stack
    });
  }
}
export const getAllRequest = async(req:Request, res:Response)=>{
try{

  const loggedUserId = req.jwtUser?.id as string;

  const user = await findUserById(loggedUserId);
  
  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not found"
    })
  }
  let result ;

  if(user.role === "customer"){
       const customer = await getCustomerId(user.id);
       result = await findRequestByCustomer(customer.id)
       return res.status(201).json({
    success:true,
    message:"fetched all requests",
    data:result
  })
  }
   if(user.role === "worker"){
       const worker = await getWorkerId(user.id);
       result = await findRequestForWorker(worker.id)
       return res.status(201).json({
    success:true,
    message:"fetched all requests",
    data:result
  })
  }

  
}catch(error){
  res.status(500).json({
      message:"Internal error "+error
    });
}
}

//get all request instead of pending
export const getBookedRequest = async(req:Request, res:Response)=>{
try{
  const loggedUserId = req.jwtUser?.id as string;

  const user = await findUserById(loggedUserId);
  
  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not found"
    })
  }
  let result ;

  if(user.role === "customer"){
       const customer = await getCustomerId(user.id);
       result = await findRequestByCustomer(customer.id)
       return res.status(201).json({
    success:true,
    message:"fetched all requests",
    data:result
  })
  }
   if(user.role === "worker"){
       const worker = await getWorkerId(user.id);
       result = await findRequestForWorker(worker.id)
       return res.status(201).json({
    success:true,
    message:"fetched all requests",
    data:result
  })
  }

  
}catch(error){
  res.status(500).json({
      message:"Internal error "+error
    });
}
}

//get request base on book id
export const getBookedRequestById = async(req:Request, res:Response)=>{
try{
 const book_id = req.body;

  
      const result = await findBookRequestByBId(book_id)
      if(!result){
        return res.status(404).json({message:"booking reuqest not found!"})
      }
       return res.status(201).json({
    success:true,
    message:"fetched Booked requests",
    data:result
  })
  
  

  
}catch(error){
  res.status(500).json({
      message:"Internal error "+error
    });
}
}


