import express from 'express'
import checkPermission from '../middleware/checkPermission.js';
import { getWorkers , getWorker, getSlots, getServices} from '../controllers/workerController.js';
import { authenticate } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/permission.js';
import { logRoute } from '../models/ActivityLogger.js';

const router = express.Router();
router.get("/workers",authenticate,checkPermission(PERMISSIONS.VIEW_WORKER),logRoute("get workers","Worker"),getWorkers);
router.get("/workers/:userId",authenticate,checkPermission(PERMISSIONS.VIEW_PROFILE),logRoute("fetched worker","Worker"),getWorker);

router.get("/:workerId/slots",getSlots);
router.get("/:workerId/services",getServices);


export default router;


