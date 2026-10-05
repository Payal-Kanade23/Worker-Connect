import express from 'express'
import {z} from 'zod';
import { login, register , refresh, logout, setRole, getLoggeduser, update_user } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import passport from 'passport';
import { googleCallback } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { logRoute } from '../models/ActivityLogger.js';
 const router = express.Router();


// --------------------------------ZOD VALIDATION--------------------------------------------
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().pipe(z.email('Invalid email address')),
  phone: z.string().trim().min(10, 'Phone number looks too short').optional(),
  password: z.string().min(5, 'Password must be at least 8 characters'),
  role: z.enum(['worker', 'customer', 'admin'], {
  error: (issue) => `Invalid role: expected worker or customer, got ${issue.input}`,
}),
})

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email('Invalid email address')),
  password: z.string().min(5, 'Password is required'),
});

router.post("/register",validate(registerSchema),register);
router.post("/login",validate(loginSchema),login)
router.post("/logout",logout)
router.post("/refresh",refresh)

router.patch("/role",authenticate , setRole);

router.get("/me",authenticate,getLoggeduser)


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  googleCallback
);

router.put("/profile",authenticate,update_user)

export default router;