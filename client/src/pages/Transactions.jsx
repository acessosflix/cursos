import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import TransactionModal from '../components/TransactionModal'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({ type: '', category: '', search: '' })
  const { t } = useLanguage()

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await axios.get(`/api/transactions?${params.toString()}`)
      let filtered = res.data.transactions

      if (filters.search) {
        filtered = filtered.filter(t =>
          t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.notes?.toLowerCase().includes(filters.search.toLowerCase())
        )
      }

      setTransactions(filtered)
    } catch (error) {
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return

    try {
      await axios.delete(`/api/transactions/${id}`)
      toast.success('Transaction deleted')
      fetchTransactions()
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  const categories = [...new Set(transactions.map(t => t.category))]

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('transactions')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          {t('addTransaction')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder={t('search')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="income">{t('income')}</option>
              <option value="expense">{t('expense')}</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{t('type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{t('category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{t('amount')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">{t('notes')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{transaction.notes || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 mr-4 dark:text-blue-400"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
