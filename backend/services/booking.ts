// src/services/booking.ts
import { pool } from "../config/db.js";
export async function getAmountDueForBooking(bookingId: number, userId: string) {
  const { rows } = await pool.query(
    `SELECT
        br.id,
        br.worker_id,
        br.status,
        ROUND(br.total_amount)::int AS amount_paise,
        br.payment_status
     FROM booking_request br
     JOIN customer_profiles cp ON br.customer_id = cp.id
     WHERE br.id = $1
       AND cp.user_id = $2`,   // ownership: booking must belong to the logged-in user
    [bookingId, userId]
  );

  const b = rows[0];
  console.log("aomount...........",b)
  if (!b) throw new Error("BOOKING_NOT_FOUND");
  if (b.payment_status === "paid") throw new Error("ALREADY_PAID");
  // Adjust to your flow: e.g. only allow payment once the worker accepted
  // if (b.status !== "accepted") throw new Error("NOT_PAYABLE");

  return { bookingId: b.id, workerId: b.worker_id, amountPaise: b.amount_paise as number };
}