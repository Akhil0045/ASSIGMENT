const Joi = require('joi');

const budgetSchema = Joi.object({
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required'
  }),
  limit: Joi.number().min(0).required().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit cannot be negative',
    'any.required': 'Limit is required'
  }),
  targetUserEmail: Joi.string().email().optional()
});

module.exports = {
  budgetSchema
};
