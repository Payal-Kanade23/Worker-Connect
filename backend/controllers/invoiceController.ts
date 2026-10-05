import PDFDocument from "pdfkit";
import { Request, Response } from "express";
import { findUserByCustomerId, findUserByWorkerId, getCustomerId, getServiceByBookedId } from "../models/User.js";
import { findBookRequestByBId } from "../models/Book.js";
import { checkInvoice, createInvoice, findInvoice } from "../models/Invoice.js";



export const addInvoice = async(req: Request, res: Response)=>{
  try{

const bookId  = req.params.bookId as string;

const existing_invoice = await checkInvoice(bookId);
if(existing_invoice){
  console.log("---------------",existing_invoice)
  res.status(200).json({
  success:true,
  message:"Invoice already exists",
  data:existing_invoice
})
}
const response = await createInvoice(bookId);

res.status(200).json({
  success:true,
  message:"Invoice created successfully",
  data:response
})

  }catch(error){
res.status(500).json({
      message: "Failed to generate invoice",
    });
  }
}