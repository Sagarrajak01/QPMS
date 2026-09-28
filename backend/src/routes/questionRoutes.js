import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

// Faculty specific question routes
router.use(protect, authorize('FACULTY'));
router.post('/bulk', questionController.bulkCreateQuestions)

router.route('/')
  .get(questionController.getQuestions)
  .post(questionController.createQuestion);


router.delete('/:id', questionController.deleteQuestion);

export default router;
