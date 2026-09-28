import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import QuestionPaper from '../models/QuestionPaper.js'; // NEW IMPORT

export const getDashboardStats = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ assignedFaculty: req.user.id });
    const subjectIds = subjects.map(s => s._id);
    
    // Count questions for this faculty's subjects
    const totalQuestions = await Question.countDocuments({ subjectId: { $in: subjectIds } });
    
    // Count papers created by this faculty
    const draftPapers = await QuestionPaper.countDocuments({ createdBy: req.user.id, status: 'DRAFT' });
    const finalizedPapers = await QuestionPaper.countDocuments({ createdBy: req.user.id, status: 'FINALIZED' });
    
    res.status(200).json({
      status: 'success',
      data: {
        assignedSubjects: subjects.length,
        totalQuestions,
        draftPapers,
        finalizedPapers
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignedSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ assignedFaculty: req.user.id }).sort({ semester: 1 });
    res.status(200).json({ status: 'success', data: subjects });
  } catch (error) {
    next(error);
  }
};