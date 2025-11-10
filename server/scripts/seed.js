import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';

dotenv.config();

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other']
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-finance');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});

    // Create test users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Created users');

    // Create transactions for user
    const now = new Date();
    const transactions = [];

    // Income transactions
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      transactions.push({
        user: user._id,
        type: 'income',
        category: categories.income[Math.floor(Math.random() * categories.income.length)],
        amount: 2000 + Math.random() * 1000,
        date: date,
        notes: `Monthly income ${i + 1}`
      });
    }

    // Expense transactions
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 180));
      transactions.push({
        user: user._id,
        type: 'expense',
        category: categories.expense[Math.floor(Math.random() * categories.expense.length)],
        amount: 10 + Math.random() * 500,
        date: date,
        notes: `Expense ${i + 1}`
      });
    }

    // Recurring transactions
    transactions.push({
      user: user._id,
      type: 'expense',
      category: 'Rent',
      amount: 1200,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      notes: 'Monthly rent',
      isRecurring: true,
      recurringFrequency: 'monthly',
      nextRecurringDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    });

    await Transaction.insertMany(transactions);
    console.log('Created transactions');

    // Create budgets
    const budgets = [
      {
        user: user._id,
        category: 'Food',
        amount: 500,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      {
        user: user._id,
        category: 'Entertainment',
        amount: 200,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      {
        user: user._id,
        category: 'Transportation',
        amount: 300,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    ];

    await Budget.insertMany(budgets);
    console.log('Created budgets');

    // Create goals
    const goals = [
      {
        user: user._id,
        title: 'Vacation Fund',
        targetAmount: 5000,
        currentAmount: 0,
        targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        description: 'Save for summer vacation'
      },
      {
        user: user._id,
        title: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: new Date(now.getFullYear() + 1, 6, 1),
        description: 'Build emergency savings'
      }
    ];

    await Goal.insertMany(goals);
    console.log('Created goals');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Admin - Email: admin@test.com, Password: password123');
    console.log('User - Email: user@test.com, Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
