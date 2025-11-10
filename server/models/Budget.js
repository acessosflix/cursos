import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount must be positive']
  },
  period: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

budgetSchema.index({ user: 1, category: 1, period: 1 });

export default mongoose.model('Budget', budgetSchema);
