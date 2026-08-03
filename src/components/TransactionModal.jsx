import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function TransactionModal({ isOpen, onClose, onTransactionAdded }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validasi basic
    if (!amount || !category || !date) {
      alert("Mohon lengkapi data wajib (Nominal, Kategori, Tanggal)")
      setIsLoading(false)
      return
    }

    if (!supabase) {
        alert("Supabase client belum terkonfigurasi. Pastikan .env sudah benar.")
        setIsLoading(false)
        return
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { 
          amount: parseFloat(amount), 
          type, 
          category, 
          date, 
          note 
        }
      ])
      .select()

    setIsLoading(false)

    if (error) {
      console.error("Error inserting transaction:", error)
      alert("Gagal menyimpan transaksi: " + error.message)
    } else {
      // Reset form
      setAmount('')
      setCategory('')
      setNote('')
      // Panggil callback
      onTransactionAdded(data[0])
      onClose()
    }
  }

  const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
  const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya']

  const categories = type === 'expense' ? expenseCategories : incomeCategories

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fade-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100">Tambah Transaksi</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-900 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'expense' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'income' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
              placeholder="Contoh: 50000"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              required
            >
              <option value="" disabled>Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              placeholder="Makan siang dengan klien"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  )
}
