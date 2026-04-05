const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const {
  listUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  systemStats,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', systemStats);

module.exports = router;
