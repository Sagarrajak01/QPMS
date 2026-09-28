import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Your account is inactive. Please contact Admin.' };
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  const userResponse = user.toObject();
  delete userResponse.passwordHash;

  return { user: userResponse, token };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-passwordHash');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return user;
};