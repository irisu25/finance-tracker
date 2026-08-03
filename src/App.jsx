import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import TransactionModal from './components/TransactionModal'
import SettingsModal from './components/SettingsModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Settings, Wallet, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'

function App() {
  const [transactions, setTransactions] = useState([])
  const [settings, setSettings] = useState({ monthly_budget: 5000000, savings_target: 1000000 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  })

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
      const { data: settingsData } = await supabase.from('user_settings').select('*').eq('id', 1).single()
      if (settingsData) setSettings(settingsData)

      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false })
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

  // All-time balance
  const totalIncomeAll = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpenseAll = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const balance = totalIncomeAll - totalExpenseAll

  // Monthly stats
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const monthlyBalance = totalIncome - totalExpense

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  const budgetPercentage = Math.min((totalExpense / settings.monthly_budget) * 100, 100)
  const isOverBudget = totalExpense > settings.monthly_budget

  const savingsPercentage = Math.min((monthlyBalance / settings.savings_target) * 100, 100)
  const isSavingsMet = monthlyBalance >= settings.savings_target

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance Tracker</h1>
            <p className="text-muted-foreground mt-1 text-sm">Pantau keuangan Anda dengan mudah dan jelas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto h-9"
            />
            <Button variant="outline" size="sm" className="h-9" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Target
            </Button>
            <Button size="sm" className="h-9" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Transaksi
            </Button>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo (Semua Waktu)</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{formatIDR(balance)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 font-mono">+{formatIDR(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-500 font-mono">-{formatIDR(totalExpense)}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress & Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Batas Pengeluaran Bulan Ini</CardTitle>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isOverBudget ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                  {isOverBudget ? 'Overbudget' : 'Aman'}
                </span>
              </div>
              <CardDescription>
                {isOverBudget 
                  ? `Melebihi batas ${formatIDR(totalExpense - settings.monthly_budget)}`
                  : `Tersisa ${formatIDR(settings.monthly_budget - totalExpense)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-destructive' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                <span>0</span>
                <span>{formatIDR(settings.monthly_budget)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Target Tabungan Bulan Ini</CardTitle>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isSavingsMet ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'}`}>
                  {isSavingsMet ? 'Tercapai 🎉' : 'On Track'}
                </span>
              </div>
              <CardDescription>
                {isSavingsMet
                  ? "Bagus! Terus pertahankan."
                  : `Kurang ${formatIDR(settings.savings_target - monthlyBalance)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 bg-blue-500" 
                  style={{ width: `${savingsPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                <span>{formatIDR(monthlyBalance < 0 ? 0 : monthlyBalance)}</span>
                <span>{formatIDR(settings.savings_target)}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>Daftar pemasukan dan pengeluaran di bulan {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Memuat data...</div>
            ) : monthlyTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Belum ada transaksi di bulan ini. Mulai catat keuangan Anda!</div>
            ) : (
              <div className="divide-y">
                {monthlyTransactions.map(tx => (
                  <div key={tx.id} className="p-6 flex justify-between items-center hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(tx.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {tx.note && ` • ${tx.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold font-mono ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(tx.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTransactionAdded={handleTransactionAdded} 
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
      />
    </div>
  )
}

export default App
