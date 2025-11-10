import { useEffect, useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../contexts/LanguageContext'
import { FiDownload } from 'react-icons/fi'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const { t } = useLanguage()

  useEffect(() => {
    fetchReport()
  }, [dateRange])

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const res = await axios.get(`/api/reports/summary?${params.toString()}`)
      setReport(res.data)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const res = await axios.get(`/api/reports/export/csv?${params.toString()}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const res = await axios.get(`/api/reports/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <FiDownload className="mr-2" />
            {t('exportCSV')}
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <FiDownload className="mr-2" />
            {t('exportPDF')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalIncome')}</p>
                <p className="text-2xl font-bold text-green-600">${report.summary.totalIncome.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalExpense')}</p>
                <p className="text-2xl font-bold text-red-600">${report.summary.totalExpense.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('balance')}</p>
                <p className="text-2xl font-bold text-blue-600">${report.summary.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {report.budgetComparison && report.budgetComparison.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Budget Comparison</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Budgeted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.budgetComparison.map((budget, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{budget.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${budget.budgeted.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${budget.spent.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${budget.remaining.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.goals && report.goals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Goals Progress</h2>
              <div className="space-y-4">
                {report.goals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-900 dark:text-white">{goal.title}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ({goal.progress.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${goal.isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
