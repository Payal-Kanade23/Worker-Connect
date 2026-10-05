import express from 'express'
import { authenticate } from '../middleware/auth.js';
import { acceptRequest, bookRequest, getAllRequest, getBookedRequestById, rejectRequest} from '../controllers/bookController.js';
import { validate } from '../middleware/validate.js';
import { PERMISSIONS } from '../utils/permission.js';
import { logRoute } from '../models/ActivityLogger.js';
const router = express.Router();



import { z } from 'zod';
import checkPermission from '../middleware/checkPermission.js';

export const createBookingSchema = z.object({
  workerId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  timeSlotId: z.number().int().positive(),
  serviceIds: z
  .array(z.string().uuid())
  .min(1, "Select at least one service"),
  description: z.string().max(1000).optional().default(''),
});

router.post("/book/request",authenticate ,checkPermission(PERMISSIONS.BOOK_REQUEST),validate(createBookingSchema),logRoute("Book Request","Booking"), bookRequest);
router.get("/book/request",authenticate ,checkPermission(PERMISSIONS.VIEW_REQUEST),logRoute("Book Request","Booking"),getAllRequest);
router.get("/book/request/:bookId",authenticate ,getBookedRequestById);

router.post("/book/request/accept/:bookingId",authenticate,checkPermission(PERMISSIONS.ACCEPT_REQUEST) ,logRoute("Accected Request","Booking"),acceptRequest);
router.patch("/book/request/reject/:bookingId",authenticate,checkPermission(PERMISSIONS.REJECT_REQUEST),logRoute("Rejected Request","Booking"),rejectRequest)





export default router;