import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { FiHome, FiDollarSign, FiPieChart, FiTarget, FiFileText, FiLogOut, FiMoon, FiSun, FiGlobe } from 'react-icons/fi'

export default function Layout() {
  const { logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: FiHome, label: t('dashboard') },
    { path: '/transactions', icon: FiDollarSign, label: t('transactions') },
    { path: '/budgets', icon: FiPieChart, label: t('budgets') },
    { path: '/goals', icon: FiTarget, label: t('goals') },
    { path: '/reports', icon: FiFileText, label: t('reports') }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">💰 Finance Manager</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">EN</option>
                <option value="pt">PT</option>
              </select>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FiLogOut className="mr-2" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
