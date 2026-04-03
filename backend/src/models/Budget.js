const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Budget cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a single user only has one budget entry per category
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
