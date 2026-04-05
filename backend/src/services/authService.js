const { prisma } = require('../config/db');
const bcrypt = require('bcrypt');

const registerUser = async (name, email, password, role = 'viewer') => {
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) throw new Error('User already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Only allow valid roles
  const allowedRoles = ['viewer', 'analyst', 'admin'];
  const assignedRole = allowedRoles.includes(role) ? role : 'viewer';

  return await prisma.user.create({
    data: { name, email, password: hashedPassword, role: assignedRole },
  });
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('Invalid email or password');
  if (!user.isActive) throw new Error('Your account has been deactivated. Contact an admin.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  return user;
};

module.exports = { registerUser, loginUser };
