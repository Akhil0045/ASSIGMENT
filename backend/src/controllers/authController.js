const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async (req, res, next) => {
  console.log('register params:', { req: !!req, res: !!res, next: typeof next });
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
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
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') res.status(401);
    next(error);
  }
};

// Get current logged in user
const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
