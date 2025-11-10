import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiX } from 'react-icons/fi'

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other']
}

export default function TransactionModal({ transaction, onClose }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly'
  })
  const { t } = useLanguage()

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: new Date(transaction.date).toISOString().split('T')[0],
        notes: transaction.notes || '',
        isRecurring: transaction.isRecurring || false,
        recurringFrequency: transaction.recurringFrequency || 'monthly'
      })
    }
  }, [transaction])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      if (transaction) {
        await axios.put(`/api/transactions/${transaction._id}`, data)
        toast.success('Transaction updated')
      } else {
        await axios.post('/api/transactions', data)
        toast.success('Transaction created')
      }
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {transaction ? t('editTransaction') : t('addTransaction')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('type')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
              required
            >
              <option value="income">{t('income')}</option>
              <option value="expense">{t('expense')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              className="mr-2"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            />
            <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">Recurring transaction</label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
