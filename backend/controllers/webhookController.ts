import { Request, Response } from "express";
import { pool } from "../config/db.js";
import {
    verifyRazorpayWebhookSignature
} from "../utils/razorpayVerify.js";

export async function razorpayWebhook(
    req: Request,
    res: Response
): Promise<void> {
    console.log("*************")

    const signature = req.headers["x-razorpay-signature"];

    if (!signature || typeof signature !== "string") {
        res.status(400).json({
            message: "Missing Razorpay signature"
        });
        return;
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
        res.status(500).json({
            message: "Webhook secret is not configured"
        });
        return;
    }

    const rawBody = req.body as Buffer;

    const isValid = verifyRazorpayWebhookSignature(
        rawBody,
        signature,
        secret
    );

    if (!isValid) {
        res.status(400).json({
            message: "Invalid webhook signature"
        });
        return;
    }

    let event: any;

    try {
        event = JSON.parse(rawBody.toString("utf8"));
    } catch {
        res.status(400).json({
            message: "Invalid JSON payload"
        });
        return;
    }

    console.log("____________",event)

    
  const eventType = event.event;
  const payment = event.payload?.payment?.entity;
  const razorpayPaymentId = payment.id;
const eventId = `${event.event}:${razorpayPaymentId}`;
console.log("Event Type:", eventType);

if (!eventType) {
    res.status(400).json({
        message: "Invalid webhook event"
    });
    return;
}

if (
    eventType !== "payment.captured" &&
    eventType !== "order.paid"
) {
    res.status(200).json({
        received: true
    });
    return;
}


console.log("Payment:", payment);

if (!payment) {
    throw new Error("Payment information missing");
}

const razorpayOrderId = payment.order_id;

console.log("Razorpay Payment ID:", razorpayPaymentId);
console.log("Razorpay Order ID:", razorpayOrderId);


    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        /*
         * 1. Check whether webhook was already processed
         */

        const existingEvent = await client.query(
            `
            SELECT id
            FROM webhook_events
            WHERE event_id = $1
            `,
            [eventId]
        );

        console.log("1--------",existingEvent)
        if (existingEvent.rowCount) {

            await client.query("ROLLBACK");

            res.status(200).json({
                received: true,
                message: "Event already processed"
            });

            return;
        }

        /*
         * 2. Store webhook event
         */

        await client.query(
            `
            INSERT INTO webhook_events
            (
                event_id,
                event_type,
                payload
            )
            VALUES ($1, $2, $3)
            `,
            [
                eventId,
                eventType,
                event
            ]
        );

        /*
         * 3. Extract Razorpay payment information
         */

        const payment =
            event.payload?.payment?.entity;

        if (!payment) {
            throw new Error(
                "Payment information missing"
            );
        }

        console.log("2.------",payment)
        const razorpayPaymentId =
            payment.id;

        const razorpayOrderId =
            payment.order_id;

        const amount =
            payment.amount;

        /*
         * 4. Find WeeConnect payment
         */

        const paymentResult = await client.query(
            `
            SELECT
                id,
                booking_id,
                razorpay_order_id,
                razorpay_payment_id,
                amount,
                status
            FROM payments
            WHERE razorpay_order_id = $1
            FOR UPDATE
            `,
            [razorpayOrderId]
        );

        if (!paymentResult.rowCount) {
            throw new Error(
                `Payment not found for order ${razorpayOrderId}`
            );
        }

        const weePayment =
            paymentResult.rows[0];

            console.log("3--------",weePayment)
        /*
         * 5. Idempotency check at payment level
         */

        if (weePayment.status === "PAID") {

            await client.query(
                `
                UPDATE webhook_events
                SET
                    processed = TRUE,
                    processed_at = CURRENT_TIMESTAMP
                WHERE event_id = $1
                `,
                [eventId]
            );

            await client.query("COMMIT");

            res.status(200).json({
                received: true,
                message: "Payment already processed"
            });

            return;
        }

        /*
         * 6. Update payment
         */

        await client.query(
            `
            UPDATE payments
            SET
                razorpay_payment_id = $1,
                amount = $2,
                status = 'PAID',
                paid_at = CURRENT_TIMESTAMP
            WHERE id = $3
            `,
            [
                razorpayPaymentId,
                amount,
                weePayment.id
            ]
        );

        console.log("2222222222222222222222222",weePayment.booking_id)
        await client.query(
            `
            UPDATE booking_request
            SET
                
                status = 'Completed'
            WHERE id = $1
            `,
            [
                weePayment.booking_id
            ]
        );
        /*_id
         * 7. Update booking
         */

        const bookingResult = await client.query(
    `SELECT
        br.id,
        br.customer_id,
        br.worker_id,
        wp.user_id AS worker_user_id
     FROM booking_request br
     JOIN worker_profiles wp
       ON wp.id = br.worker_id
     WHERE br.id = $1`,
    [weePayment.booking_id]
);

        console.log("4---------",bookingResult)
        if (!bookingResult.rowCount) {
            throw new Error(
                "Booking not found"
            );
        }

        const booking =
            bookingResult.rows[0];

        /*
         * 8. Create worker notification
         */

        await client.query(
    `INSERT INTO notifications
     (user_id, type, title, message, booking_id, payment_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
        booking.worker_user_id,
        "PAYMENT_RECEIVED",
        "Payment Received",
        `Customer has paid for booking #${booking.id}. Your payment will be settled by WeeConnect.`,
        booking.id,
        razorpayPaymentId
    ]
);

        /*
         * 9. Mark webhook as processed
         */

        await client.query(
            `
            UPDATE webhook_events
            SET
                processed = TRUE,
                processed_at = CURRENT_TIMESTAMP
            WHERE event_id = $1
            `,
            [eventId]
        );

        await client.query("COMMIT");

        res.status(200).json({
            received: true
        });

    } catch (error) {

        console.log("5........",error)
        await client.query("ROLLBACK");

        console.error(
            "Razorpay webhook error:",
            error
        );

        res.status(500).json({
            message: "Webhook processing failed"
        });

    } finally {

        client.release();
    }
}