import { getAllWorkers, getServiceByWorkerId, getWorkerById } from "../models/User.js";
import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { generateWorkerSlots, findOrCreateTimeSlot } from "../models/Time.js";

export const getWorkers = async (req:Request , res:Response) =>{
    try{
     const result =  await getAllWorkers();
     if(!result){
        return res.status(404).json({
            success:false,
            message:"No Records Found"
        })
     }

     res.status(201).json({
        success:true,
        message:"Records Fetched Successfully!",
        data:result
     })

    }catch(error){

        res.status(500).json({
            success:false,
            message:"Internal Server Error " + error
        })
    }
} 

export const getWorker = async (req:Request , res:Response) =>{
    try{
     const userId = req.params.userId as string;
     const result =  await getWorkerById(userId);
     if(!result){
        return res.status(404).json({
            success:false,
            message:"No Records Found"
        })
     }

     res.status(201).json({
        success:true,
        message:"Records Fetched Successfully!",
        data:result
     })

    }catch(error){

        res.status(500).json({
            success:false,
            message:"Internal Server Error " + error
        })
    }
} 


export const getSlots = async(req:Request , res:Response)=>{
     const {workerId} = req.params;
        const {date} = req.query;

        const client = await pool.connect();
    try{

       
        const response = await client.query(
            `SELECT hourly_rate , employment_type , hour_per_day , available_from , available_to FROM worker_profiles WHERE id = $1`,[workerId]
        )


        if(!response.rows.length)return res.status(404).json({error:"Worker Not Found!"})
        const worker = response.rows[0];

        const generated = generateWorkerSlots(worker);

        const result = [];
         for (const slot of generated) {
      const timeSlotId = await findOrCreateTimeSlot(client, slot.start_time, slot.end_time);
      
      const busyCheck = await client.query(
        `SELECT status FROM worker_time_status 
         WHERE worker_id = $1 AND time_slot_id = $2 AND date = $3`,
        [workerId, timeSlotId, date]
      );
      const status = busyCheck.rows[0];
      result.push({
        timeSlotId,
        label: `${slot.start_time}-${slot.end_time}`,
        status: status === 'busy' ? 'busy' : ' free'
      });
    }
        res.json({ 
            success:true,
            message:"slots fetched",
            data:{
             rate:worker.hourly_rate, 
             slots: result
            }
          });

    }catch(error){
         res.status(500).json({
            success:false,
            message:"Internal Server Error " + error
        })
    }finally {
    client.release();
  }
}


export const getServices = async(req:Request , res:Response) =>{
    const workerId = req.params.workerId as string ;
    try{

          const response = await getServiceByWorkerId(workerId)
          res.json({
            success:true,
            message:"Services Fetched Successfully!",
            data:response
          })
    }catch(error){
         res.status(500).json({
            success:false,
            message:"Internal Server Error " + error
        })
    }
}

//customer booked service on booking_request
export const getBookedServices = async(req:Request , res:Response) =>{
    const bookId = req.body;
    try{

          const response = await getServiceByWorkerId(bookId)
          
          res.json({
            success:true,
            message:"Services Fetched Successfully!",
            data:response
          })
    }catch(error){
         res.status(500).json({
            success:false,
            message:"Internal Server Error " + error
        })
    }
}



