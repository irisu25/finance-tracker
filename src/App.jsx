import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Finance Tracker
          </h1>
          <button className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5">
            + Transaksi Baru
          </button>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Total Saldo</h3>
            </div>
            <p className="text-4xl font-bold tracking-tight">Rp 12.500.000</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Pemasukan Bulan Ini</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">+ Rp 15.000.000</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Pengeluaran Bulan Ini</h3>
            </div>
            <p className="text-3xl font-bold text-rose-400">- Rp 2.500.000</p>
          </div>
        </div>
        
        {/* Budget Progress & Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-300 font-medium mb-1">Batas Pengeluaran Bulanan</h3>
                <p className="text-sm text-slate-400">Sisa budget: Rp 2.500.000</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">Aman (50%)</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: '50%' }}>
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Rp 0</span>
              <span>Rp 5.000.000</span>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-300 font-medium mb-1">Target Tabungan Bulan Ini</h3>
                <p className="text-sm text-slate-400">Kurang: Rp 1.000.000</p>
              </div>
              <span className="text-sm font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">On Track (75%)</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: '75%' }}>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Terkumpul: Rp 3.000.000</span>
              <span>Target: Rp 4.000.000</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
