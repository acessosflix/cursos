import express from 'express';
import { query } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import csvWriter from 'csv-writer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(protect);

// @route   GET /api/reports/summary
// @desc    Get financial summary report
// @access  Private
router.get('/summary', [
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

    const transactions = await Transaction.find(query).sort('date');
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Monthly breakdown
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += t.amount;
    });

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    // Get active budgets
    const budgets = await Budget.find({ user: req.user._id, isActive: true });
    const budgetComparison = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: { $gte: budget.startDate, $lte: budget.endDate || new Date() }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        return {
          category: budget.category,
          budgeted: budget.amount,
          spent: spent.length > 0 ? spent[0].total : 0,
          remaining: budget.amount - (spent.length > 0 ? spent[0].total : 0)
        };
      })
    );

    // Get goals
    const goals = await Goal.find({ user: req.user._id });

    res.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      },
      monthlyData,
      categoryBreakdown,
      budgetComparison,
      goals: goals.map(g => ({
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        progress: (g.currentAmount / g.targetAmount) * 100,
        isCompleted: g.isCompleted
      }))
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reports/export/csv
// @desc    Export transactions as CSV
// @access  Private
router.get('/export/csv', [
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

    const transactions = await Transaction.find(query).sort('date');

    const csvPath = path.join(__dirname, '../temp', `transactions-${Date.now()}.csv`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(csvPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const writer = csvWriter.createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'type', title: 'Type' },
        { id: 'category', title: 'Category' },
        { id: 'amount', title: 'Amount' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    await writer.writeRecords(
      transactions.map(t => ({
        date: t.date.toISOString().split('T')[0],
        type: t.type,
        category: t.category,
        amount: t.amount,
        notes: t.notes || ''
      }))
    );

    res.download(csvPath, `transactions-${Date.now()}.csv`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(csvPath)) {
          fs.unlinkSync(csvPath);
        }
      }, 1000);
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reports/export/pdf
// @desc    Export report as PDF
// @access  Private
router.get('/export/pdf', [
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

    const transactions = await Transaction.find(query).sort('date');
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const doc = new PDFDocument();
    const filename = `report-${Date.now()}.pdf`;
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Financial Report', 100, 100);
    doc.fontSize(12).text(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`, 100, 130);

    // Summary
    doc.fontSize(16).text('Summary', 100, 170);
    doc.fontSize(12)
      .text(`Total Income: $${totalIncome.toFixed(2)}`, 100, 200)
      .text(`Total Expenses: $${totalExpense.toFixed(2)}`, 100, 220)
      .text(`Balance: $${balance.toFixed(2)}`, 100, 240);

    // Transactions
    let y = 280;
    doc.fontSize(16).text('Transactions', 100, y);
    y += 30;

    transactions.slice(0, 50).forEach((t, index) => {
      if (y > 700) {
        doc.addPage();
        y = 100;
      }
      doc.fontSize(10)
        .text(`${t.date.toISOString().split('T')[0]} | ${t.type.toUpperCase()} | ${t.category} | $${t.amount.toFixed(2)}`, 100, y);
      y += 20;
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

export default router;
