const express = require('express');
const router = express.Router();
const { getSummary, getCharts } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

// All analytics routes require authentication
router.use(protect);

// ─── READ: All roles (data scope enforced in service) ────────────────────────
router.get('/summary', getSummary);
router.get('/charts',  getCharts);

module.exports = router;
