import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiX } from 'react-icons/fi'

const categories = ['Food', 'Rent', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other']

export default function BudgetModal({ budget, onClose }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  })
  const { t } = useLanguage()

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period
      })
    }
  }, [budget])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      if (budget) {
        await axios.put(`/api/budgets/${budget._id}`, data)
        toast.success('Budget updated')
      } else {
        await axios.post('/api/budgets', data)
        toast.success('Budget created')
      }
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('setBudget')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

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
