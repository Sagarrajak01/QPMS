import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';          // NEW IMPORT
import QuestionPaper from '../models/QuestionPaper.js'; // NEW IMPORT

// --- Dashboard ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalFaculty = await User.countDocuments({ role: 'FACULTY' });
    const totalSubjects = await Subject.countDocuments();
    res.status(200).json({ status: 'success', data: { totalFaculty, totalSubjects, totalQuestions: 0, totalQuestionPapers: 0 } });
  } catch (error) { next(error); }
};

// --- Faculty Management ---
export const getFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: 'FACULTY' }).select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: faculty });
  } catch (error) { next(error); }
};

export const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, department, phone } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (exists) return res.status(400).json({ status: 'error', message: 'Email or Employee ID already exists' });

    const newFaculty = await User.create({ name, email, passwordHash: password, role: 'FACULTY', employeeId, department, phone });
    const response = newFaculty.toObject();
    delete response.passwordHash;
    res.status(201).json({ status: 'success', data: response });
  } catch (error) { next(error); }
};

export const toggleFacultyStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Faculty not found' });
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await user.save();
    res.status(200).json({ status: 'success', data: { _id: user._id, status: user.status } });
  } catch (error) { next(error); }
};

export const deleteFaculty = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Faculty not found' });
    res.status(200).json({ status: 'success', message: 'Faculty deleted successfully' });
  } catch (error) { next(error); }
};

// --- Subject Management ---
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().populate('assignedFaculty', 'name email employeeId').sort({ semester: 1 });
    res.status(200).json({ status: 'success', data: subjects });
  } catch (error) { next(error); }
};

export const createSubject = async (req, res, next) => {
  try {
    const { code, name, department, semester, description, assignedFaculty } = req.body;
    const exists = await Subject.findOne({ code });
    if (exists) return res.status(400).json({ status: 'error', message: 'Subject code already exists' });

    const newSubject = await Subject.create({ code, name, department, semester, description, assignedFaculty, createdBy: req.user.id });
    const populatedSubject = await Subject.findById(newSubject._id).populate('assignedFaculty', 'name email employeeId');
    res.status(201).json({ status: 'success', data: populatedSubject });
  } catch (error) { next(error); }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedFaculty', 'name email employeeId');
    if (!subject) return res.status(404).json({ status: 'error', message: 'Subject not found' });
    res.status(200).json({ status: 'success', data: subject });
  } catch (error) { next(error); }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ status: 'error', message: 'Subject not found' });
    res.status(200).json({ status: 'success', message: 'Subject deleted successfully' });
  } catch (error) { next(error); }
};

export const bulkCreateFaculty = async (req, res, next) => {
  try {
    const { facultyList } = req.body;
    let addedCount = 0;

    for (const fac of facultyList) {
      if (!fac.email || !fac.employeeId || !fac.name) continue; // Skip invalid rows
      
      const exists = await User.findOne({ $or: [{ email: fac.email }, { employeeId: fac.employeeId }] });
      if (!exists) {
        // Create user. Mongoose pre-save hook will hash the password.
        await User.create({
          name: fac.name,
          email: fac.email,
          passwordHash: fac.password || 'password123', // Default password if empty
          role: 'FACULTY',
          employeeId: fac.employeeId,
          department: fac.department || 'General',
          phone: fac.phone || ''
        });
        addedCount++;
      }
    }
    res.status(201).json({ status: 'success', message: `${addedCount} faculty members added successfully via CSV.` });
  } catch (error) {
    next(error);
  }
};