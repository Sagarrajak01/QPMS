import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as paperController from '../controllers/paperController.js';

const router = express.Router();

router.use(protect, authorize('FACULTY'));

router.route('/')
  .get(paperController.getPapers)
  .post(paperController.generatePaper);

router.route('/:id')
  .get(paperController.getPaperById)
  .delete(paperController.deletePaper);

router.patch('/:id/finalize', paperController.finalizePaper);

export default router;