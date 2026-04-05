const analyticsService = require('../services/analyticsService');

// ─── Analyst + Admin ─────────────────────────────────────────────────────────
// Supports ?userId or ?email to get a single user's summary
const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getBalanceSummary(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json(summary);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

// ─── Analyst + Admin ─────────────────────────────────────────────────────────
// Supports ?userId or ?email to get a single user's chart data
const getCharts = async (req, res, next) => {
  try {
    const charts = await analyticsService.getChartData(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json(charts);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

module.exports = {
  getSummary,
  getCharts,
};
