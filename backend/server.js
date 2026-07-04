import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRout.js';
import dashboardRouter from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB (startup handled in startServer)

//ROUTES
app.use('/api/user', userRouter);
app.use('/api/income', incomeRouter);
app.use('/api/expense', expenseRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});

app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    return res.json({ ok: true, db: 'connected' });
  }
  return res.status(503).json({ ok: false, db: 'disconnected' });
});

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server Started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err?.message || err);
    console.error(`Current NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    // Avoid printing full connection strings; show only that we received a URI.
    console.error('MONGODB_URI present:', Boolean(process.env.MONGODB_URI));
    process.exit(1);
  }
};


startServer();

