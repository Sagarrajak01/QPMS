import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examType: { type: String, required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    instructions: { type: String },
    status: { type: String, enum: ['DRAFT', 'FINALIZED', 'ARCHIVED'], default: 'DRAFT' },
    isMultipleSets: { type: Boolean, default: false },

    sets: [
      {
        setName: { type: String }, // e.g., 'Set A', 'Set B', 'Set C' or 'Single Set'
        sections: [
          {
            name: { type: String }, // e.g., 'Section A'
            questions: [
              {
                questionNumber: { type: Number },
                questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
                type: { type: String },
                questionText: { type: String },
                options: [{ label: String, text: String }],
                marks: { type: Number },
                unit: { type: Number },
                difficulty: { type: String }
              }
            ]
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('QuestionPaper', questionPaperSchema);