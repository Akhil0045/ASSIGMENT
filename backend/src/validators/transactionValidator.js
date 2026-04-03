const Joi = require('joi');

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().min(2).max(50).required(),
  description: Joi.string().allow('').optional(),
  date: Joi.date().iso().optional(),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().min(2).max(50).optional(),
  description: Joi.string().allow('').optional(),
  date: Joi.date().iso().optional(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
};
