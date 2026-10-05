import { pool } from "../config/db.js";

export const addRequest = async(currentUser:string,workerId:string,bookingDate:string,timeSlotId:number,serviceIds:string[],description:string) =>{
  const client = await pool.connect();
  try{
  await client.query('BEGIN');
 
  const customerRes = await client.query(
    `SELECT id from customer_profiles WHERE user_id = $1`,[currentUser]
  )

  if(!customerRes){
     await client.query('ROLLBACK')
    throw {status:404 , message:"Customer slot not found"}
  }
  const customerId = customerRes.rows[0].id;
  console.log("customer id:",customerId)

  const info = await client.query(
    `SELECT w.hourly_rate 
    FROM worker_profiles w 
    WHERE w.id = $1 `,
    [workerId]
  );
 if(!info.rows.length){
    await client.query('ROLLBACK')
    throw {status:404 , message:"Worker  not found"}
  }
  const time_info = await client.query(`
    SELECT start_time , end_time from time_slot WHERE id = $1 
    `,[timeSlotId])

 if(!time_info.rows.length){
    await client.query('ROLLBACK')
    throw {status:404 , message:" time slot not found"}
  }

 
  const {hourly_rate} = info.rows[0];
   const {start_time , end_time} = time_info.rows[0];

  const hours = (new Date(`1970-01-01T${end_time}`).getTime() -
        new Date(`1970-01-01T${start_time}`).getTime()) / 3600000;
    const totalAmount = hourly_rate * hours;

    const bookingRes = await client.query(
  `INSERT INTO booking_request
    (customer_id, worker_id, booking_date, status, total_amount, description, time_slot_id)
   VALUES ($1, $2, $3, 'pending', $4, $5, $6)
   RETURNING id, status, total_amount`,
  [
    customerId,
    workerId,
    bookingDate,
   
    totalAmount,
    description,
    timeSlotId
  ]
);

    const booking = bookingRes.rows[0];
    

    for(const serviceId of serviceIds){
       await client.query(
      `INSERT INTO booking_services (booking_id , service_id) VALUES ($1,$2)
      ON CONFLICT (booking_id, service_id) DO NOTHING`,[booking.id , serviceId ]
    )
    }
   
// to add free status into worker_time_status
    let worker_status = await client.query(
      `SELECT status from worker_time_status WHERE worker_id = $1 AND date=$2  AND  time_slot_id=$3 `,[workerId,bookingDate,timeSlotId]
    )
    
    if(worker_status.rows.length === 0 ){
       worker_status = await client.query(
      `INSERT INTO worker_time_status (worker_id , time_slot_id , date ,status) VALUES ($1 , $2 , $3 , $4) RETURNING status`,[workerId,timeSlotId,bookingDate,"free"]
    )
    }
    const workerStatus = worker_status.rows[0].status;
     
    
    await client.query('COMMIT')
    return {booking,workerStatus};
  }catch(error:any){
    await client.query('ROLLBACK')
  
  if (error.code === "23505") {
    if (error.constraint === "unique_worker_slot_date") {
      throw new Error(
        "This worker is already booked for the selected date and time slot." + error.stack
      );
    }

    throw new Error("Duplicate booking record.");
  }

  throw error;
  }
}

export const findRequestByCustomer = async(customer_id:string)=>{
      const client = await pool.connect();

  try{
    const res = await client.query(`
      SELECT 
      br.*,
      cu.name AS customer_name,
      wu.name AS worker_name
  FROM booking_request br

  JOIN customer_profiles cp
      ON br.customer_id = cp.id

  JOIN worker_profiles wp
      ON br.worker_id = wp.id

  JOIN users cu
      ON cp.user_id = cu.id

  JOIN users wu
      ON wp.user_id = wu.id

  WHERE br.customer_id = $1 `,[customer_id])

  
      console.log("booking_req",res)
    return res.rows;

  }catch(error){
    throw error;
  }
}

export const findRequestForWorker = async(worker_id:string)=>{
      const client = await pool.connect();

  try{
    const res = await client.query(`
    
  SELECT 
    br.*,
    wu.name AS worker_name,
    cu.name AS customer_name
  FROM booking_request br

  JOIN worker_profiles wp
    ON br.worker_id = wp.id

  JOIN customer_profiles cp
    ON br.customer_id = cp.id

  JOIN users cu
    ON cp.user_id = cu.id

  JOIN users wu
    ON wp.user_id = wu.id

  WHERE br.worker_id = $1
  `,
  [worker_id])

    return res.rows;

  }catch(error){
    throw error;
  }
}


export const setAcceptRequest = async(booking_id:string,worker_id:string)=>{
        const client = await pool.connect();

  try{
     const res = await client.query(`
      UPDATE booking_request SET status=$1 WHERE id = $2 RETURNING status total_amount`,["accepted",booking_id])

      await client.query(`
        DELETE FROM booking_request WHERE worker_id=$1 AND status=$2`,[worker_id,"pending"])
      const setstatus = await client.query(
        `UPDATE worker_time_status SET status=$1 WHERE worker_id = $2 `,["busy",worker_id]
      )
      return res.rows[0];

      

  }catch(error){
     throw error;
  }
}

export const setRejectRequest = async(booking_id:string, reason:string)=>{
        const client = await pool.connect();

  try{
     const res = await client.query(`
      UPDATE booking_request SET status=$1 , rejection_reason=$2 WHERE id = $3 RETURNING status , total_amount`,["rejected",reason,booking_id])

     
    
      return res.rows[0];

      

  }catch(error){
     throw error;
  }
}


//remove pending request from this
export const findAllRequestForWorker = async(worker_id:string)=>{
      const client = await pool.connect();

  try{
    const res = await client.query(`
    
  SELECT 
    br.*,
    wu.name AS worker_name,
    cu.name AS customer_name
  FROM booking_request br

  JOIN worker_profiles wp
    ON br.worker_id = wp.id

  JOIN customer_profiles cp
    ON br.customer_id = cp.id

  JOIN users cu
    ON cp.user_id = cu.id

  JOIN users wu
    ON wp.user_id = wu.id

  WHERE br.worker_id = $1
  `,
  [worker_id])
      console.log("booking_req",res)

    return res.rows;

  }catch(error){
    throw error;
  }
}

//get book request base on book id
//remove pending request from this
interface BookRequest{
  total_amount:number,
  created_at:Date
}
export const findBookRequestByBId = async(book_id:string):Promise<BookRequest>=>{
      const client = await pool.connect();

  try{
    const res = await client.query<BookRequest>(`
    
  SELECT 
    total_amount , created_at FROM booking_request
  WHERE id = $1
  `,
  [book_id])
      console.log("booking_req",res)

    return res.rows[0];

  }catch(error){
    throw error;
  }
}

