import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as facultyController from '../controllers/facultyController.js';

const router = express.Router();

router.use(protect, authorize('FACULTY'));

router.get('/dashboard', facultyController.getDashboardStats);
router.get('/subjects', facultyController.getAssignedSubjects);

export default router;