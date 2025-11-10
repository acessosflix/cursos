import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions for user
// @access  Private
router.get('/', [
  query('type').optional().isIn(['income', 'expense']),
  query('category').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('isRecurring').optional().isBoolean(),
  body('recurringFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transactionData = {
      ...req.body,
      user: req.user._id
    };

    // Calculate next recurring date if recurring
    if (transactionData.isRecurring && transactionData.recurringFrequency) {
      const date = new Date(transactionData.date || Date.now());
      switch (transactionData.recurringFrequency) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
      transactionData.nextRecurringDate = date;
    }

    const transaction = await Transaction.create(transactionData);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', [
  body('type').optional().isIn(['income', 'expense']),
  body('category').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('date').optional().isISO8601(),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('isRecurring').optional().isBoolean(),
  body('recurringFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        transaction[key] = req.body[key];
      }
    });

    // Recalculate next recurring date if needed
    if (transaction.isRecurring && transaction.recurringFrequency) {
      const date = new Date(transaction.date);
      switch (transaction.recurringFrequency) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
      transaction.nextRecurringDate = date;
    }

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction summary
// @access  Private
router.get('/stats/summary', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      categoryBreakdown
    });
  } catch (error) {
    next(error);
  }
});

export default router;
