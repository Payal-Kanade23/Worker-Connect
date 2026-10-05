import express from 'express'
import { authenticate } from '../middleware/auth.js';
import { addInvoice } from '../controllers/invoiceController.js';
import { generateInvoice } from '../controllers/InvoiceDesign.js';
import { logRoute } from '../models/ActivityLogger.js';
const router = express.Router();

router.post("/invoice/:bookId",authenticate,logRoute("Invoice generated","Invoice"),addInvoice);


router.get("/invoice/:invoiceId/pdf", authenticate , logRoute("PDF created -invoice","Invoice"),generateInvoice);




export default router;
