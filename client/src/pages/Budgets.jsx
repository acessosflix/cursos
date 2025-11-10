import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import BudgetModal from '../components/BudgetModal'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const { t } = useLanguage()

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('/api/budgets')
      setBudgets(res.data)
    } catch (error) {
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return

    try {
      await axios.delete(`/api/budgets/${id}`)
      toast.success('Budget deleted')
      fetchBudgets()
    } catch (error) {
      toast.error('Failed to delete budget')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('budgets')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          {t('setBudget')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.category}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingBudget(budget)
                    setShowModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(budget._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Budget: ${budget.amount.toFixed(2)}</span>
                <span className={budget.isExceeded ? 'text-red-600' : ''}>
                  Spent: ${budget.spentAmount.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${
                    budget.isExceeded ? 'bg-red-600' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {budget.percentage.toFixed(1)}% used
              </div>
            </div>

            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Remaining: <span className={`font-semibold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${budget.remaining.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => {
            setShowModal(false)
            setEditingBudget(null)
            fetchBudgets()
          }}
        />
      )}
    </div>
  )
}
