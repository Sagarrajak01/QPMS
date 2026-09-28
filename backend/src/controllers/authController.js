import * as authService from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const data = await authService.loginUser(email, password);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    // With stateless JWT, backend logout is primarily a client-side action (clearing the token).
    // A robust system might use a token blacklist here, but standard JWT accepts this.
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};