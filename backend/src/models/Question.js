import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['MCQ', 'ONE_WORD', 'SUBJECTIVE'], required: true },
    questionText: { type: String, required: true },
    // Only for MCQ
    options: [{ label: String, text: String }],
    correctAnswer: { type: String },
    // Only for ONE_WORD
    acceptedAnswers: [{ type: String }],
    
    marks: { type: Number, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    unit: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);