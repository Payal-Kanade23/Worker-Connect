import crypto from "crypto";

export function verifyRazorpayWebhookSignature(
    rawBody: Buffer,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
}