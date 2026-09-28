import Question from '../models/Question.js';
import Subject from '../models/Subject.js';

const checkSubjectAccess = async (subjectId, facultyId) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw { statusCode: 404, message: 'Subject not found' };
  
  // Enforce Authorization: Faculty can only manage assigned subjects
  if (!subject.assignedFaculty.includes(facultyId)) {
    throw { statusCode: 403, message: 'Not authorized for this subject' };
  }
  return subject;
};

export const getQuestions = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ assignedFaculty: req.user.id }).select('_id');
    const subjectIds = subjects.map(s => s._id);

    const { subjectId, unit, type, difficulty, search } = req.query;
    let query = { subjectId: { $in: subjectIds } };

    if (subjectId) query.subjectId = subjectId;
    if (unit) query.unit = Number(unit);
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.questionText = { $regex: search, $options: 'i' };

    const questions = await Question.find(query).populate('subjectId', 'name code').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: questions });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    await checkSubjectAccess(req.body.subjectId, req.user.id);
    
    const questionData = { ...req.body, createdBy: req.user.id };
    
    // Clean up data based on type
    if (questionData.type === 'SUBJECTIVE') {
      delete questionData.options;
      delete questionData.correctAnswer;
      delete questionData.acceptedAnswers;
    } else if (questionData.type === 'ONE_WORD') {
      delete questionData.options;
      delete questionData.correctAnswer;
      // Convert comma string to array if needed
      if (typeof questionData.acceptedAnswers === 'string') {
        questionData.acceptedAnswers = questionData.acceptedAnswers.split(',').map(s => s.trim());
      }
    }

    const question = await Question.create(questionData);
    res.status(201).json({ status: 'success', data: question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found' });
    
    await checkSubjectAccess(question.subjectId, req.user.id);
    await question.deleteOne();
    
    res.status(200).json({ status: 'success', message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};
export const bulkCreateQuestions = async (req, res, next) => {
  try {
    const { subjectId, questions } = req.body;
    await checkSubjectAccess(subjectId, req.user.id);
    
    const formattedQuestions = questions.map(q => {
      const type = (q.type || 'MCQ').toUpperCase();
      let formatted = {
        subjectId,
        createdBy: req.user.id,
        type: type,
        questionText: q.questionText,
        marks: Number(q.marks) || 1,
        difficulty: (q.difficulty || 'EASY').toUpperCase(),
        unit: Number(q.unit) || 1,
        status: 'ACTIVE'
      };

      if (type === 'MCQ') {
        formatted.options = [
          { label: 'A', text: q.optionA || '' },
          { label: 'B', text: q.optionB || '' },
          { label: 'C', text: q.optionC || '' },
          { label: 'D', text: q.optionD || '' }
        ];
        formatted.correctAnswer = (q.correctAnswer || 'A').toUpperCase();
      } else if (type === 'ONE_WORD') {
        formatted.acceptedAnswers = q.acceptedAnswers ? q.acceptedAnswers.split(',').map(s => s.trim()) : [];
      }
      return formatted;
    });

    const created = await Question.insertMany(formattedQuestions);
    res.status(201).json({ status: 'success', message: `${created.length} questions added successfully via CSV.` });
  } catch (error) {
    next(error);
  }
};