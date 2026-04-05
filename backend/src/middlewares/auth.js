const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch full user including role and isActive
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (!req.user.isActive) {
        res.status(403);
        throw new Error('Your account has been deactivated. Contact an admin.');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(res.statusCode === 200 ? 401 : res.statusCode);
      next(new Error(error.message || 'Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

module.exports = { protect };
