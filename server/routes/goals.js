import express from 'express';
import { body, validationResult } from 'express-validator';
import Goal from '../models/Goal.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Helper function to calculate current amount from transactions
const calculateCurrentAmount = async (userId, goalStartDate) => {
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: goalStartDate }
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return Math.max(0, totalIncome - totalExpense);
};

// @route   GET /api/goals
// @desc    Get all goals for user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort('-createdAt');
    
    // Update current amounts based on transactions
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        if (!goal.isCompleted) {
          const currentAmount = await calculateCurrentAmount(req.user._id, goal.createdAt);
          goal.currentAmount = Math.min(currentAmount, goal.targetAmount);
          
          // Check if goal is completed
          if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
            goal.completedDate = new Date();
            await goal.save();
          }
        }

        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        return {
          ...goal.toObject(),
          progress: Math.min(progress, 100)
        };
      })
    );

    res.json(goalsWithProgress);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/goals/:id
// @desc    Get single goal
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update current amount
    if (!goal.isCompleted) {
      const currentAmount = await calculateCurrentAmount(req.user._id, goal.createdAt);
      goal.currentAmount = Math.min(currentAmount, goal.targetAmount);
      
      if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
        goal.isCompleted = true;
        goal.completedDate = new Date();
        await goal.save();
      }
    }

    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    res.json({
      ...goal.toObject(),
      progress: Math.min(progress, 100)
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
  body('targetDate').isISO8601().withMessage('Invalid target date format'),
  body('description').optional().isString().isLength({ max: 500 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const goal = await Goal.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ min: 0 }),
  body('targetDate').optional().isISO8601(),
  body('description').optional().isString().isLength({ max: 500 }),
  body('currentAmount').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key];
      }
    });

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedDate = new Date();
    }

    await goal.save();
    
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    res.json({
      ...goal.toObject(),
      progress: Math.min(progress, 100)
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
