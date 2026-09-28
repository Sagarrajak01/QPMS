import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);

router.route('/faculty')
  .get(adminController.getFaculty)
  .post(adminController.createFaculty);

router.post('/faculty/bulk', adminController.bulkCreateFaculty); // <-- ADD THIS LINE

router.route('/faculty')
  .get(adminController.getFaculty)
  
router.route('/faculty/:id')
  .delete(adminController.deleteFaculty); // New Delete Route
router.patch('/faculty/:id/status', adminController.toggleFacultyStatus);

router.route('/subjects')
  .get(adminController.getSubjects)
  .post(adminController.createSubject);
  
router.route('/subjects/:id')
  .put(adminController.updateSubject)
  .delete(adminController.deleteSubject); // New Delete Route

export default router;
