import { Request, Response } from "express";
import { pool } from "../config/db.js";
export async function getNotifications(
    req: Request,
    res: Response
): Promise<void> {

    try {

        const userId = req.jwtUser?.id;

        const result = await pool.query(
            `
            SELECT
                id,
                type,
                title,
                message,
                booking_id,
                payment_id,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        res.status(200).json({
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
}
export async function markNotificationRead(
    req: Request,
    res: Response
): Promise<void> {

    try {

        const userId = req.jwtUser?.id;
        const notificationId = req.params.id;

        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            AND user_id = $2
            RETURNING id
            `,
            [
                notificationId,
                userId
            ]
        );

        if (!result.rowCount) {
            res.status(404).json({
                message: "Notification not found"
            });
            return;
        }

        res.status(200).json({
            message: "Notification marked as read"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update notification"
        });
    }
}