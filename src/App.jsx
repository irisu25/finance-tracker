import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import TransactionModal from './components/TransactionModal'
import SettingsModal from './components/SettingsModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Plus, Settings, Wallet, TrendingUp, TrendingDown, Trash2, Utensils, Car, ShoppingBag, Receipt, Film, Briefcase, Award, Gift, LineChart, CircleDollarSign, Sun, Moon, LogOut, LogIn } from 'lucide-react'
import AuthModal from './components/AuthModal'

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Makanan': return <Utensils className="w-5 h-5" />;
    case 'Transportasi': return <Car className="w-5 h-5" />;
    case 'Belanja': return <ShoppingBag className="w-5 h-5" />;
    case 'Tagihan': return <Receipt className="w-5 h-5" />;
    case 'Hiburan': return <Film className="w-5 h-5" />;
    case 'Gaji': return <Briefcase className="w-5 h-5" />;
    case 'Bonus': return <Award className="w-5 h-5" />;
    case 'Investasi': return <LineChart className="w-5 h-5" />;
    case 'Hadiah': return <Gift className="w-5 h-5" />;
    default: return <CircleDollarSign className="w-5 h-5" />;
  }
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [settings, setSettings] = useState({ monthly_budget: 5000000, savings_target: 1000000 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [txToDelete, setTxToDelete] = useState(null)
  const [session, setSession] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem("vite-ui-theme") || "light")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  })
  const [filterCategory, setFilterCategory] = useState("Semua")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("vite-ui-theme", theme)
  }, [theme])

  useEffect(() => {
    setFilterCategory("Semua")
  }, [selectedMonth])

  useEffect(() => {
    if (session) {
      fetchData()
    } else {
      setTransactions([])
      setSettings({ monthly_budget: 5000000, savings_target: 1000000 })
      setIsLoading(false)
    }
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return
    setIsLoading(true)

    try {
      const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', session.user.id)
      if (settingsData && settingsData.length > 0) {
        setSettings(settingsData[0])
      } else {
        const { data: newSettings, error } = await supabase.from('user_settings').insert({ user_id: session.user.id, monthly_budget: 5000000, savings_target: 1000000 }).select()
        if (newSettings && newSettings.length > 0) setSettings(newSettings[0])
      }

      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).order('date', { ascending: false })
      if (txData) setTransactions(txData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = (actionCallback) => {
    if (!session) {
      setIsAuthOpen(true)
    } else {
      actionCallback()
    }
  }

  const handleTransactionAdded = (newTx) => {
    setTransactions((prev) => [newTx, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  const confirmDelete = async () => {
    if(!txToDelete) return
    const { error } = await supabase.from('transactions').delete().eq('id', txToDelete.id)
    if(error) {
      toast.error("Gagal menghapus: " + error.message)
    } else {
      setTransactions(transactions.filter(t => t.id !== txToDelete.id))
      toast.success("Transaksi berhasil dihapus")
    }
    setTxToDelete(null)
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

  const availableCategories = ["Semua", ...new Set(monthlyTransactions.map(t => t.category))]
  const displayedTransactions = filterCategory === "Semua" ? monthlyTransactions : monthlyTransactions.filter(t => t.category === filterCategory)

  // Chart Data Preparation
  const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
  const expenseColors = [
    "var(--color-Makanan)",
    "var(--color-Transportasi)",
    "var(--color-Belanja)",
    "var(--color-Tagihan)",
    "var(--color-Hiburan)",
    "var(--color-Lainnya)"
  ]

  const chartData = expenseCategories.map((cat, i) => {
    const total = monthlyTransactions.filter(t => t.type === 'expense' && t.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
    return { category: cat, amount: total, fill: expenseColors[i] }
  }).filter(d => d.amount > 0)

  const chartConfig = {
    amount: { label: "Pengeluaran" },
    Makanan: { label: "Makanan", color: "#f43f5e" },
    Transportasi: { label: "Transportasi", color: "#3b82f6" },
    Belanja: { label: "Belanja", color: "#8b5cf6" },
    Tagihan: { label: "Tagihan", color: "#f59e0b" },
    Hiburan: { label: "Hiburan", color: "#10b981" },
    Lainnya: { label: "Lainnya", color: "#64748b" },
  }

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
          <div className="flex justify-between items-start w-full sm:w-auto">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finance Tracker</h1>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Pantau keuangan Anda dengan mudah dan jelas.</p>
            </div>
            
            {/* Mobile-only Top Right Controls */}
            <div className="flex sm:hidden items-center gap-2 mt-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {session ? (
                <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => supabase.auth.signOut()} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="default" size="sm" className="h-8 w-8 p-0" onClick={() => setIsAuthOpen(true)}>
                  <LogIn className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[150px] sm:w-auto h-9 shrink-0"
            />
            <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => handleAction(() => setIsSettingsOpen(true))}>
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Target</span>
            </Button>
            
            {/* Desktop-only Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {session ? (
                <Button variant="destructive" size="sm" className="h-9 w-9 p-0" onClick={() => supabase.auth.signOut()} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="default" size="sm" className="h-9" onClick={() => setIsAuthOpen(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo (Semua Waktu)</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono">{formatIDR(balance)}</div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pemasukan</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500 hidden sm:block" />
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-2xl font-bold text-emerald-600 dark:text-emerald-500 font-mono truncate">+{formatIDR(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pengeluaran</CardTitle>
              <TrendingDown className="w-4 h-4 text-rose-500 hidden sm:block" />
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-2xl font-bold text-rose-600 dark:text-rose-500 font-mono truncate">-{formatIDR(totalExpense)}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress & Targets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          
          <Card className="col-span-1">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <CardTitle className="text-xs sm:text-base">Batas Budget</CardTitle>
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${isOverBudget ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                  {isOverBudget ? 'Overbudget' : 'Aman'}
                </span>
              </div>
              <CardDescription className="text-[10px] sm:text-sm">
                {isOverBudget 
                  ? `Sisa ${formatIDR(totalExpense - settings.monthly_budget)}`
                  : `Sisa ${formatIDR(settings.monthly_budget - totalExpense)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-destructive' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 font-mono">
                <span className="truncate mr-1">{formatIDR(totalExpense)}</span>
                <span className="truncate">{formatIDR(settings.monthly_budget)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <CardTitle className="text-xs sm:text-base">Target Tabung</CardTitle>
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${isSavingsMet ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'}`}>
                  {isSavingsMet ? 'Tercapai' : 'On Track'}
                </span>
              </div>
              <CardDescription className="text-[10px] sm:text-sm">
                {isSavingsMet 
                  ? `Lebih ${formatIDR(monthlyBalance - settings.savings_target)}`
                  : `Kurang ${formatIDR(settings.savings_target - monthlyBalance)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isSavingsMet ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                  style={{ width: `${savingsPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 font-mono">
                <span className="truncate mr-1">{formatIDR(monthlyBalance)}</span>
                <span className="truncate">{formatIDR(settings.savings_target)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & History Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart */}
          <Card className="col-span-1 flex flex-col">
            <CardHeader className="items-center pb-2">
              <CardTitle>Distribusi Pengeluaran</CardTitle>
              <CardDescription>Bulan {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={chartData} dataKey="amount" nameKey="category" innerRadius={60} strokeWidth={5} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">Belum ada pengeluaran.</div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>Daftar pemasukan dan pengeluaran.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-9" onClick={() => handleAction(() => setIsModalOpen(true))}>
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah Transaksi</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
                {availableCategories.length > 1 && (
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] h-9">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Memuat data...</div>
            ) : displayedTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Belum ada transaksi yang sesuai.</div>
            ) : (
              <div className="divide-y">
                {displayedTransactions.map(tx => (
                  <div key={tx.id} className="p-6 flex justify-between items-center hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.note || tx.category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span>{new Date(tx.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">{tx.category}</span>
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
                        onClick={() => setTxToDelete(tx)}
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

      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTransactionAdded={handleTransactionAdded} 
        userId={session?.user?.id}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        userId={session?.user?.id}
      />

      <AlertDialog open={!!txToDelete} onOpenChange={(open) => !open && setTxToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Transaksi ini akan dihapus permanen dari riwayat keuangan Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <Toaster position="bottom-right" richColors />
    </div>
  )
}

export default App
