import { pool } from "../config/db.js";

export const createInvoice = async (b_id : string)=>{
    try{
        
 const invoiceNumber =
  `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const result = await pool.query(
  `
  INSERT INTO invoices
    (invoice_number, booking_id)
  VALUES
    ($1, $2)
  RETURNING id, invoice_number
  `,
  [invoiceNumber, b_id]
);
return result.rows[0];
    }catch(error){
        throw error;
    }
   

}

export const checkInvoice = async (b_id : string)=>{
    try{
        
 

const result = await pool.query(
  `
  SELECT * FROM invoices
    WHERE booking_id = $1
  
  `,
  [ b_id]
);
return result.rows[0];
    }catch(error){
        throw error;
    }
   

}


export const findInvoice = async (i_id : string)=>{
    try{
        
 

const result = await pool.query(
  `
  SELECT * FROM invoices
    WHERE id = $1
  
  `,
  [ i_id]
);
return result.rows[0];
    }catch(error){
        throw error;
    }
   

}