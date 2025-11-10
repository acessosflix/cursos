import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        axios.get('/api/transactions/stats/summary'),
        axios.get('/api/transactions?limit=1000')
      ])

      setSummary(summaryRes.data)

      // Process monthly data
      const monthly = {}
      transactionsRes.data.transactions.forEach(t => {
        const month = new Date(t.date).toISOString().slice(0, 7)
        if (!monthly[month]) {
          monthly[month] = { month, income: 0, expense: 0 }
        }
        monthly[month][t.type] += t.amount
      })
      setMonthlyData(Object.values(monthly).slice(-6))

      // Process category data
      const categories = Object.entries(summaryRes.data.categoryBreakdown || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
      setCategoryData(categories)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const stats = [
    { label: t('totalIncome'), value: summary?.totalIncome || 0, icon: FiTrendingUp, color: 'text-green-600' },
    { label: t('totalExpense'), value: summary?.totalExpense || 0, icon: FiTrendingDown, color: 'text-red-600' },
    { label: t('balance'), value: summary?.balance || 0, icon: FiDollarSign, color: 'text-blue-600' },
    { label: 'Transactions', value: summary?.transactionCount || 0, icon: FiPieChart, color: 'text-purple-600' }
  ]

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} mt-2`}>
                    ${stat.value.toFixed(2)}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#FF8042" name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
