import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function SettingsModal({ isOpen, onClose, currentSettings, onSettingsUpdated }) {
  const [budget, setBudget] = useState('')
  const [target, setTarget] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Update input fields when modal opens with current settings
  useEffect(() => {
    if (currentSettings) {
      setBudget(currentSettings.monthly_budget || '')
      setTarget(currentSettings.savings_target || '')
    }
  }, [currentSettings, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!budget || !target) {
      alert("Mohon isi kedua target")
      setIsLoading(false)
      return
    }

    const updatedSettings = {
      monthly_budget: parseFloat(budget),
      savings_target: parseFloat(target)
    }

    const { error } = await supabase
      .from('user_settings')
      .update(updatedSettings)
      .eq('id', 1)

    setIsLoading(false)

    if (error) {
      console.error("Error updating settings:", error)
      alert("Gagal memperbarui pengaturan: " + error.message)
    } else {
      onSettingsUpdated(updatedSettings)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fade-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100">Pengaturan Target</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Budget Limit */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Batas Maksimal Pengeluaran (Rp)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
              placeholder="Contoh: 5000000"
              required
            />
          </div>

          {/* Savings Target */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-1">Target Tabungan Bulanan (Rp)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              placeholder="Contoh: 1000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </div>
  )
}
