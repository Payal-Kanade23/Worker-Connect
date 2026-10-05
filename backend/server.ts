import dotenv from 'dotenv';
dotenv.config(); // must run first — every other import below reads process.env
import workerRoutes from './routes/workerRoutes.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pool } from './config/db.js';
import './config/passport.js'; // registers the Google strategy before routes use it
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
 import invoiceRoutes from "./routes/invoiceRoutes.js"
 import auditRoutes from "./routes/auditRoutes.js"
import paymentRouter from "./routes/payment.js"
import webhookRouter from "./routes/webhookRoutes.js"
import notificationRouter from "./routes/notificationRoutes.js"
const app = express();


app.use(
    "/api/webhooks",
    webhookRouter
);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // required so the browser sends/accepts the httpOnly cookies
  })
);




app.use('/auth', authRoutes);
app.use("/api",  workerRoutes);
app.use("/api",  bookRoutes);
app.use("/api",  invoiceRoutes);
app.use("/api",auditRoutes);
app.use("/api/payment", paymentRouter);

app.use(
    "/api/notifications",
    notificationRouter
);

app.get('/', (req, res) => res.send('Worker Connect API running'));

// Verifies the DB is actually reachable at startup, instead of finding out
// on the first real request.
pool
  .query('SELECT NOW()')
  .then(() => console.log('✅ Database connected'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));