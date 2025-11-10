import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    goals: 'Goals',
    reports: 'Reports',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expenses',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    category: 'Category',
    amount: 'Amount',
    date: 'Date',
    notes: 'Notes',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    type: 'Type',
    monthlyBudget: 'Monthly Budget',
    setBudget: 'Set Budget',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    progress: 'Progress',
    createGoal: 'Create Goal',
    editGoal: 'Edit Goal',
    title: 'Title',
    description: 'Description',
    targetDate: 'Target Date',
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode'
  },
  pt: {
    dashboard: 'Painel',
    transactions: 'Transações',
    budgets: 'Orçamentos',
    goals: 'Metas',
    reports: 'Relatórios',
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    income: 'Receita',
    expense: 'Despesa',
    balance: 'Saldo',
    totalIncome: 'Receita Total',
    totalExpense: 'Despesas Totais',
    addTransaction: 'Adicionar Transação',
    editTransaction: 'Editar Transação',
    deleteTransaction: 'Excluir Transação',
    category: 'Categoria',
    amount: 'Valor',
    date: 'Data',
    notes: 'Notas',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    search: 'Buscar',
    filter: 'Filtrar',
    type: 'Tipo',
    monthlyBudget: 'Orçamento Mensal',
    setBudget: 'Definir Orçamento',
    targetAmount: 'Valor Alvo',
    currentAmount: 'Valor Atual',
    progress: 'Progresso',
    createGoal: 'Criar Meta',
    editGoal: 'Editar Meta',
    title: 'Título',
    description: 'Descrição',
    targetDate: 'Data Alvo',
    exportCSV: 'Exportar CSV',
    exportPDF: 'Exportar PDF',
    name: 'Nome',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro'
  }
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
