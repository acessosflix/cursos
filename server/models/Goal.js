import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be positive']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

goalSchema.index({ user: 1, isCompleted: 1 });

export default mongoose.model('Goal', goalSchema);
