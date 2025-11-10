import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiPlus, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi'
import GoalModal from '../components/GoalModal'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const { t } = useLanguage()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await axios.get('/api/goals')
      setGoals(res.data)
    } catch (error) {
      toast.error('Failed to fetch goals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return

    try {
      await axios.delete(`/api/goals/${id}`)
      toast.success('Goal deleted')
      fetchGoals()
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('goals')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          {t('createGoal')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  {goal.title}
                  {goal.isCompleted && <FiCheck className="ml-2 text-green-600" />}
                </h3>
                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingGoal(goal)
                    setShowModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}</span>
                <span>{goal.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${
                    goal.isCompleted ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Target Date: {new Date(goal.targetDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false)
            setEditingGoal(null)
            fetchGoals()
          }}
        />
      )}
    </div>
  )
}
