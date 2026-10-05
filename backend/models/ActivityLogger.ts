// backend/activityLogger.ts
// Core logging service. Call logActivity(...) directly from anywhere in your
// app (auth controller, post controller, etc), or use the middleware below
// to auto-log every request that hits a given route.

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { pool } from '../config/db.js';

export interface ActivityLog {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string; // ISO timestamp
}
 
export interface LogActivityInput {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | number | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}
/**
 * Write one row to activity_logs.
 * Never throws — logging failures should not break the actual request.
 */
export async function logActivity({
  userId = null,
  userEmail = null,
  action,
  entityType = null,
  entityId = null,
  description = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}: LogActivityInput): Promise<void> {
  if (!action) {
    console.error('logActivity called without an "action" — skipping log');
    return;
  }

  try {
    await pool.query(
      `INSERT INTO activity_logs
        (user_id, user_email, action, entity_type, entity_id, description, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        userEmail,
        action,
        entityType,
        entityId != null ? String(entityId) : null,
        description,
        ipAddress,
        userAgent,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (err) {
    console.error('Failed to write activity log:', (err as Error).message);
  }
}

/**
 * Express middleware factory. Attach to any route to auto-log that the
 * route was hit, using req.user (assumes your auth middleware sets it).
 *
 * Example:
 *   router.post('/posts/:id', requireAuth, logRoute('post.update', 'post'), updatePost);
 */
export function logRoute(action: string, entityType?: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {

    console.log("jwt user:",req.jwtUser)
    // Log after the response is sent so we know whether it succeeded.
    res.on('finish', () => {
      if (res.statusCode >= 400) return; // only log successful actions by default

      logActivity({
        userId: req.jwtUser?.id! ?? null,
        userEmail: req.jwtUser?.email ?? null,
        action,
        entityType,
        entityId: (req.params?.id as string) ?? null,
        description: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          params: req.params,
          query: req.query,
        },
      });
    });

    next();
  };
}