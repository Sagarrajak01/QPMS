import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import paperRoutes from './routes/paperRoutes.js'; // <-- NEW

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'success', message: 'QPMS API is running' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/papers', paperRoutes); // <-- NEW

app.use((req, res, next) => res.status(404).json({ status: 'error', message: 'Route not found' }));
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ status: 'error', message: err.message || 'Server Error' }));

export default app;