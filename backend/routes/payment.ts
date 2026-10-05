// src/routes/payment.ts
import { Router } from "express";
import crypto from "node:crypto";
import { razorpay } from "../config/razorpay.js";
import { pool } from "../config/db.js";       // your existing pg Pool
import { authenticate } from "../middleware/auth.js";// your existing auth
import { getAmountDueForBooking } from "../services/booking.js";
const router = Router();

// 1) Create order
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const bookingId = Number(req.body.bookingId);
    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({ error: "Invalid booking" });
    }

    const due = await getAmountDueForBooking(bookingId, req.jwtUser!.id);
    if (due.amountPaise < 100) return res.status(400).json({ error: "Invalid amount" });

    const newAmountPaise = Math.round(due.amountPaise * 100);
    const order = await razorpay.orders.create({
      amount: newAmountPaise,
      currency: "INR",
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: { userId: String(req.jwtUser!.id), bookingId: String(bookingId), workerId: due.workerId },
    });

    await pool.query(
      `INSERT INTO payments (user_id, booking_id, razorpay_order_id, amount, currency)
       VALUES ($1, $2, $3, $4, 'INR')`,
      [req.jwtUser!.id, bookingId, order.id, newAmountPaise]
    );

    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    if (err.message === "BOOKING_NOT_FOUND") return res.status(404).json({ error: "Booking not found" });
    if (err.message === "ALREADY_PAID") return res.status(409).json({ error: "Already paid" });
    console.error(err);
    res.status(500).json({ error: "Could not create order" +err});
  }
});

// 2) Verify after checkout
router.post("/verify", authenticate, async (req, res) => {

  try{

     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

  if (!valid) return res.status(400).json({ success: false });


  res.json({ success: true ,
    message:"Payment verified successfully!",
   
  });
} catch(error){
  res.status(500).json({message:"Internal server error"+error})
}
  }
);

export default router;