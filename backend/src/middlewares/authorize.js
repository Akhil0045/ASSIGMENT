/**
 * Role-based access control middleware.
 * Usage: authorize('admin') or authorize('analyst', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    // Check if user is active
    if (req.user.isActive === false) {
      res.status(403);
      return next(new Error('Your account has been deactivated'));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Access denied. Required role: ${roles.join(' or ')}`));
    }

    next();
  };
};

module.exports = { authorize };
