import { Router } from "express";
import express from "express";
import { razorpayWebhook } from "../controllers/webhookController.js";

const router = Router();

router.post(
    "/razorpay",
    express.raw({
        type: "*/*",
    }),
    (req, res, next) => {
        console.log("🔥 Razorpay route matched");
        console.log("Content-Type:", req.headers["content-type"]);
        console.log("Signature:", req.headers["x-razorpay-signature"]);
        console.log("Is Buffer:", Buffer.isBuffer(req.body));

        next();
    },
    razorpayWebhook
);

export default router;