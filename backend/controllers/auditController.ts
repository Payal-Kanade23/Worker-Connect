
import { Router, Request, Response, RequestHandler } from 'express';
import { pool } from '../config/db.js';
import { ActivityLog } from '../models/ActivityLogger.js';
export interface PaginatedLogs {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(String(req.query.page), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 25, 1), 100);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (req.query.action) {
      values.push(req.query.action);
      conditions.push(`action = $${values.length}`);
    }
    if (req.query.userId) {
      values.push(req.query.userId);
      conditions.push(`user_id = $${values.length}`);
    }
    if (req.query.search) {
      values.push(`%${req.query.search}%`);
      conditions.push(`(description ILIKE $${values.length} OR user_email ILIKE $${values.length})`);
    }
    if (req.query.startDate) {
      values.push(req.query.startDate);
      conditions.push(`created_at >= $${values.length}`);
    }
    if (req.query.endDate) {
      values.push(req.query.endDate);
      conditions.push(`created_at <= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM activity_logs ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    values.push(limit);
    values.push(offset);
    const dataResult = await pool.query<ActivityLog>(
      `SELECT id, user_id, user_email, action, entity_type, entity_id,
              description, ip_address, user_agent, metadata, created_at
       FROM activity_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const response: PaginatedLogs = {
      logs: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };

    res.json(response);
  } catch (err) {
    console.error('Failed to fetch activity logs:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
}

export const deleteLogs = async (req: Request, res: Response) => {
  try {
    const days = parseInt(String(req.query.olderThanDays), 10);
    if (!days || days < 1) {
      return res.status(400).json({ error: 'olderThanDays query param is required and must be a positive number' });
    }
    const result = await pool.query(
      `DELETE FROM activity_logs WHERE created_at < NOW() - ($1 || ' days')::interval`,
      [days]
    );
    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error('Failed to purge activity logs:', err);
    res.status(500).json({ error: 'Failed to purge activity logs' });
  }
}