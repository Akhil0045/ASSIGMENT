const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser(name, email, password, role);

    res.status(201).json({
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user.id),
    });
  } catch (error) {
    if (error.message === 'User already exists') res.status(400);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    res.json({
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user.id),
    });
  } catch (error) {
    if (
      error.message === 'Invalid email or password' ||
      error.message.includes('deactivated')
    ) {
      res.status(401);
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
