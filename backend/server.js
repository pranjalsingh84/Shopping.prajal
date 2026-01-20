import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

/* =======================
   🔥 HARD CORS FIX
   ======================= */
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://shopping-prajal-xh3u.vercel.app',   // <-- apna Vercel URL baad me yahan update karna
    ],
    credentials: true,
  })
);

/* =======================
   BODY PARSER
   ======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   ROUTES
   ======================= */
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

/* =======================
   PAYPAL CONFIG
   ======================= */
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

/* =======================
   TEST ROUTE (DEBUG)
   ======================= */
app.get('/api/test', (req, res) => {
  res.json({ status: 'CORS working perfectly' });
});

/* =======================
   PRODUCTION
   ======================= */
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();

  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

/* =======================
   ERRORS
   ======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   START
   ======================= */
app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
