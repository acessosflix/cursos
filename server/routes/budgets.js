import express from 'express';
import { body, validationResult } from 'express-validator';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/budgets
// @desc    Get all budgets for user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort('-createdAt');
    
    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = budget.startDate;
        const endDate = budget.endDate || new Date();
        
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spentAmount = spent.length > 0 ? spent[0].total : 0;
        const remaining = budget.amount - spentAmount;
        const percentage = (spentAmount / budget.amount) * 100;

        return {
          ...budget.toObject(),
          spentAmount,
          remaining,
          percentage: Math.min(percentage, 100),
          isExceeded: spentAmount > budget.amount
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/budgets/:id
// @desc    Get single budget
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate spent amount
    const startDate = budget.startDate;
    const endDate = budget.endDate || new Date();
    
    const spent = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spentAmount = spent.length > 0 ? spent[0].total : 0;
    const remaining = budget.amount - spentAmount;
    const percentage = (spentAmount / budget.amount) * 100;

    res.json({
      ...budget.toObject(),
      spentAmount,
      remaining,
      percentage: Math.min(percentage, 100),
      isExceeded: spentAmount > budget.amount
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/budgets
// @desc    Create new budget
// @access  Private
router.post('/', [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('period').optional().isIn(['monthly', 'yearly']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount, period = 'monthly', startDate, endDate } = req.body;

    // Calculate end date if not provided
    let calculatedEndDate = endDate;
    if (!calculatedEndDate) {
      const start = startDate ? new Date(startDate) : new Date();
      calculatedEndDate = new Date(start);
      if (period === 'monthly') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1);
      } else {
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
      }
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      period,
      startDate: startDate || new Date(),
      endDate: calculatedEndDate
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', [
  body('category').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('period').optional().isIn(['monthly', 'yearly']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('isActive').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        budget[key] = req.body[key];
      }
    });

    await budget.save();
    res.json(budget);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
