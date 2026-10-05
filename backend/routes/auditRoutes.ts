// backend/logsRoutes.ts
// Mount this in your main app with:
//   import logsRoutes from './logsRoutes';
//   app.use('/api/admin/logs', requireAdmin, logsRoutes);
//
// requireAdmin is YOUR existing auth/role-check middleware — swap in whatever
// you already use to gate admin-only routes. A minimal placeholder is at the
// bottom of this file if you don't have one yet.
import express from 'express'
import { getLogs , deleteLogs} from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import checkPermission from '../middleware/checkPermission.js';
import { PERMISSIONS } from '../utils/permission.js';

const router = express.Router();

// GET /api/admin/logs
// Query params (all optional):
//   page       - default 1
//   limit      - default 25, max 100
//   action     - exact match, e.g. 'login'
//   userId     - filter by user id
//   search     - matches description or user_email (ILIKE)
//   startDate  - ISO date, inclusive
//   endDate    - ISO date, inclusive
router.get('/logs', authenticate, checkPermission(PERMISSIONS.VIEW_LOGS), getLogs);

// GET /api/admin/logs/actions
// Returns the distinct action values seen so far, for populating a filter dropdown.
// router.get('/actions', async (_req: Request, res: Response) => {
//   try {
//     const result = await pool.query<{ action: string }>(
//       `SELECT DISTINCT action FROM activity_logs ORDER BY action ASC`
//     );
//     res.json({ actions: result.rows.map((r) => r.action) });
//   } catch (err) {
//     console.error('Failed to fetch distinct actions:', err);
//     res.status(500).json({ error: 'Failed to fetch actions' });
//   }
// });

// DELETE /api/admin/logs?olderThanDays=90
// Optional housekeeping endpoint to purge old logs.
router.delete('/logs',authenticate, checkPermission(PERMISSIONS.VIEW_LOGS),deleteLogs );

export default router;

