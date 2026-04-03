const User = require('../models/User');

const registerUser = async (name, email, password) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return user;
  } else {
    throw new Error('Invalid email or password');
  }
};

module.exports = {
  registerUser,
  loginUser,
};
