import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import TransactionModal from './components/TransactionModal'

function App() {
  const [transactions, setTransactions] = useState([])
  const [settings, setSettings] = useState({ monthly_budget: 5000000, savings_target: 1000000 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    if (!supabase) {
      console.warn("Supabase client is not initialized.")
      setIsLoading(false)
      return
    }

    try {
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (settingsData) setSettings(settingsData)

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
      
      if (txData) setTransactions(txData)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransactionAdded = (newTx) => {
    setTransactions((prev) => [newTx, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  const handleDelete = async (id) => {
    if(!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if(error) {
      alert("Gagal menghapus: " + error.message)
    } else {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  // Kalkulasi
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const balance = totalIncome - totalExpense

  // Format IDR
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  // Budget calculations
  const budgetPercentage = Math.min((totalExpense / settings.monthly_budget) * 100, 100)
  let budgetColor = "from-emerald-400 via-yellow-400 to-rose-400"
  let budgetStatus = "Aman"
  let budgetStatusColor = "text-emerald-400 bg-emerald-400/10"
  
  if (budgetPercentage >= 90) {
    budgetColor = "from-rose-500 to-rose-400"
    budgetStatus = "Bahaya!"
    budgetStatusColor = "text-rose-400 bg-rose-400/10"
  } else if (budgetPercentage >= 70) {
    budgetColor = "from-yellow-500 to-yellow-400"
    budgetStatus = "Hati-hati"
    budgetStatusColor = "text-yellow-400 bg-yellow-400/10"
  }

  // Savings calculations
  const savingsPercentage = Math.min((balance / settings.savings_target) * 100, 100)
  let savingsStatus = "Belum Tercapai"
  let savingsStatusColor = "text-slate-400 bg-slate-400/10"
  if (savingsPercentage >= 100) {
    savingsStatus = "Tercapai! 🎉"
    savingsStatusColor = "text-emerald-400 bg-emerald-400/10"
  } else if (savingsPercentage >= 50) {
    savingsStatus = "On Track"
    savingsStatusColor = "text-blue-400 bg-blue-400/10"
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Finance Tracker
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
          >
            + Transaksi Baru
          </button>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Total Saldo</h3>
            </div>
            <p className="text-4xl font-bold tracking-tight">{formatIDR(balance)}</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Pemasukan Bulan Ini</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{formatIDR(totalIncome)}</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Pengeluaran Bulan Ini</h3>
            </div>
            <p className="text-3xl font-bold text-rose-400">{formatIDR(totalExpense)}</p>
          </div>
        </div>
        
        {/* Budget Progress & Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Budget Limit */}
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-300 font-medium mb-1">Batas Pengeluaran Bulanan</h3>
                <p className="text-sm text-slate-400">
                  {totalExpense > settings.monthly_budget 
                    ? `Overbudget: ${formatIDR(totalExpense - settings.monthly_budget)}`
                    : `Sisa budget: ${formatIDR(settings.monthly_budget - totalExpense)}`
                  }
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${budgetStatusColor}`}>
                {budgetStatus} ({Math.round(budgetPercentage)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden p-0.5">
              <div className={`bg-gradient-to-r ${budgetColor} h-full rounded-full transition-all duration-1000 ease-out relative`} style={{ width: `${budgetPercentage}%` }}>
                {budgetPercentage > 0 && <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Rp 0</span>
              <span>{formatIDR(settings.monthly_budget)}</span>
            </div>
          </div>

          {/* Savings Target */}
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-300 font-medium mb-1">Target Tabungan (Min. Saldo)</h3>
                <p className="text-sm text-slate-400">
                  {balance >= settings.savings_target
                    ? "Target tercapai bulan ini!"
                    : `Kurang: ${formatIDR(settings.savings_target - balance)}`
                  }
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${savingsStatusColor}`}>
                {savingsStatus} ({Math.round(savingsPercentage)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${savingsPercentage}%` }}>
                {savingsPercentage > 0 && <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Terkumpul: {formatIDR(balance < 0 ? 0 : balance)}</span>
              <span>Target: {formatIDR(settings.savings_target)}</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-slate-700/50">
            <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
          </div>
          <div className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Memuat data...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Belum ada transaksi. Tambahkan transaksi pertama Anda!</div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-700/20 transition-colors group">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {tx.type === 'income' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{tx.category}</p>
                        <p className="text-sm text-slate-400">{new Date(tx.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} {tx.note && `• ${tx.note}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`font-bold text-xl ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        title="Hapus"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTransactionAdded={handleTransactionAdded} 
      />
    </div>
  )
}

export default App
