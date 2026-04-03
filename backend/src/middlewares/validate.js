const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400);
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new Error(errorMessage));
  }
  next();
};

module.exports = { validate };
