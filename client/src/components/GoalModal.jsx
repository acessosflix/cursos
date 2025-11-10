import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiX } from 'react-icons/fi'

export default function GoalModal({ goal, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  })
  const { t } = useLanguage()

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
        description: goal.description || ''
      })
    }
  }, [goal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      }

      if (goal) {
        await axios.put(`/api/goals/${goal._id}`, data)
        toast.success('Goal updated')
      } else {
        await axios.post('/api/goals', data)
        toast.success('Goal created')
      }
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save goal')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {goal ? t('editGoal') : t('createGoal')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('targetAmount')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('targetDate')}</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
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
