import QuestionPaper from '../models/QuestionPaper.js';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

export const generatePaper = async (req, res, next) => {
  try {
    const { title, subjectId, examType, semester, academicYear, durationMinutes, totalMarks, instructions, isMultipleSets, blueprint } = req.body;

    // Verify Subject access
    const subject = await Subject.findById(subjectId);
    if (!subject || !subject.assignedFaculty.includes(req.user.id)) {
      return res.status(403).json({ status: 'error', message: 'Not authorized for this subject' });
    }

    const numSets = isMultipleSets ? 3 : 1;
    const setNames = isMultipleSets ? ['Set A', 'Set B', 'Set C'] : ['Standard Set'];
    
    // Initialize empty sets
    const generatedSets = setNames.map(name => ({ setName: name, sections: [] }));

    // Process each section from blueprint
    for (const sec of blueprint) {
      // Fetch all available questions for this subject and type
      const availableQuestions = await Question.find({ subjectId, type: sec.type });
      
      if (availableQuestions.length === 0) {
        return res.status(400).json({ status: 'error', message: `No questions found for type ${sec.type}. Please add questions to the Question Bank first.` });
      }

      // Shuffle all available questions
      const shuffledQuestions = shuffleArray(availableQuestions);

      for (let i = 0; i < numSets; i++) {
        let selectedQuestions = [];
        const requiredCount = parseInt(sec.count);
        
        // Try to pick different questions for different sets by shifting the slice window
        let startIdx = (i * requiredCount) % shuffledQuestions.length;
        
        for (let j = 0; j < requiredCount; j++) {
          const qIndex = (startIdx + j) % shuffledQuestions.length; // Wrap around if we run out
          selectedQuestions.push(shuffledQuestions[qIndex]);
        }

        // Shuffle the final selection again so the order is unpredictable
        selectedQuestions = shuffleArray(selectedQuestions);

        // Format snapshot
        const formattedQuestions = selectedQuestions.map((q, idx) => ({
          questionNumber: idx + 1,
          questionId: q._id,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          marks: parseInt(sec.marksPerQuestion),
          unit: q.unit,
          difficulty: q.difficulty
        }));

        generatedSets[i].sections.push({
          name: sec.name,
          questions: formattedQuestions
        });
      }
    }

    // Save as DRAFT
    const paper = await QuestionPaper.create({
      title, subjectId, createdBy: req.user.id, examType, semester, academicYear,
      durationMinutes, totalMarks, instructions, isMultipleSets, sets: generatedSets, status: 'DRAFT'
    });

    res.status(201).json({ status: 'success', data: paper });
  } catch (error) {
    next(error);
  }
};

export const getPapers = async (req, res, next) => {
  try {
    const papers = await QuestionPaper.find({ createdBy: req.user.id })
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: papers });
  } catch (error) {
    next(error);
  }
};

export const getPaperById = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).populate('subjectId', 'name code department');
    if (!paper || paper.createdBy.toString() !== req.user.id) {
      return res.status(404).json({ status: 'error', message: 'Paper not found' });
    }
    res.status(200).json({ status: 'success', data: paper });
  } catch (error) {
    next(error);
  }
};

export const finalizePaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ status: 'error', message: 'Paper not found' });
    
    paper.status = 'FINALIZED';
    await paper.save();
    
    res.status(200).json({ status: 'success', message: 'Paper finalized successfully', data: paper });
  } catch (error) {
    next(error);
  }
};

export const deletePaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findByIdAndDelete(req.params.id);
    if (!paper) return res.status(404).json({ status: 'error', message: 'Paper not found' });
    res.status(200).json({ status: 'success', message: 'Paper deleted successfully' });
  } catch (error) {
    next(error);
  }
};