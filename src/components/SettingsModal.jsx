import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CurrencyInput from "./CurrencyInput"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const NEEDS_OPTIONS = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
const DEFAULT_NEEDS = ['Makanan', 'Transportasi']

const readStoredNeeds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("ft_needs_categories") || 'null')
    if (Array.isArray(parsed)) return parsed.filter(c => NEEDS_OPTIONS.includes(c))
  } catch { /* abaikan, pakai default */ }
  return DEFAULT_NEEDS
}

export default function SettingsModal({ isOpen, onClose, currentSettings, onSettingsUpdated, userId }) {
  const [budget, setBudget] = useState('')
  const [target, setTarget] = useState('')
  const [weeklyBudget, setWeeklyBudget] = useState('')
  const [needs, setNeeds] = useState(DEFAULT_NEEDS)
  const [ruleNeeds, setRuleNeeds] = useState('50')
  const [ruleWants, setRuleWants] = useState('30')
  const [ruleSave, setRuleSave] = useState('20')
  const [isLoading, setIsLoading] = useState(false)

  const readStoredRule = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem("ft_rule_pcts") || 'null')
      if (parsed) return parsed
    } catch { /* abaikan */ }
    return null
  }

  useEffect(() => {
    if (currentSettings) {
      setBudget(currentSettings.monthly_budget ?? '')
      setTarget(currentSettings.savings_target ?? '')
      setWeeklyBudget(currentSettings.weekly_food_budget ?? localStorage.getItem("ft_weekly_food_budget") ?? '')
      setNeeds(Array.isArray(currentSettings.needs_categories) ? currentSettings.needs_categories.filter(c => NEEDS_OPTIONS.includes(c)) : readStoredNeeds())
      const stored = readStoredRule()
      setRuleNeeds(String(currentSettings.needs_pct ?? stored?.needs ?? 50))
      setRuleWants(String(currentSettings.wants_pct ?? stored?.wants ?? 30))
      setRuleSave(String(currentSettings.save_pct ?? stored?.save ?? 20))
    }
  }, [currentSettings, isOpen])

  const toggleNeed = (cat) => {
    setNeeds(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parsedBudget = Number(budget)
    const parsedTarget = Number(target)
    const parsedWeekly = weeklyBudget === '' ? 0 : Number(weeklyBudget)
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      toast.error("Budget harus angka 0 atau lebih")
      return
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
      toast.error("Target tabungan harus angka 0 atau lebih")
      return
    }
    if (!Number.isFinite(parsedWeekly) || parsedWeekly < 0) {
      toast.error("Budget mingguan harus angka 0 atau lebih")
      return
    }
    const rNeeds = Number(ruleNeeds), rWants = Number(ruleWants), rSave = Number(ruleSave)
    if (![rNeeds, rWants, rSave].every(v => Number.isFinite(v) && v >= 0 && v <= 100)) {
      toast.error("Persen aturan harus 0–100")
      return
    }
    if (rNeeds + rWants + rSave !== 100) {
      toast.error(`Total persen harus 100 (sekarang ${rNeeds + rWants + rSave})`)
      return
    }
    if (!supabase) {
      toast.error("Supabase belum terkonfigurasi. Cek .env.")
      return
    }
    if (!userId) {
      toast.error("Anda harus login dulu.")
      return
    }
    setIsLoading(true)

    const updatedSettings = {
      monthly_budget: parsedBudget,
      savings_target: parsedTarget,
      weekly_food_budget: parsedWeekly,
      needs_categories: needs,
      needs_pct: rNeeds,
      wants_pct: rWants,
      save_pct: rSave
    }

    const { error } = await supabase
      .from('user_settings')
      .update(updatedSettings)
      .eq('user_id', userId)

    // Fallback kalau kolom baru belum ada di DB (migrasi belum dijalankan):
    // simpan nilai baru lokal agar tidak hilang.
    if (error && /(weekly_food_budget|needs_categories|needs_pct|wants_pct|save_pct)/i.test(error.message || '')) {
      console.error("New settings columns missing, retrying without them:", error)
      const { error: retryError } = await supabase
        .from('user_settings')
        .update({ monthly_budget: parsedBudget, savings_target: parsedTarget })
        .eq('user_id', userId)
      setIsLoading(false)
      if (retryError) {
        toast.error("Gagal memperbarui pengaturan: " + retryError.message)
        return
      }
      localStorage.setItem("ft_weekly_food_budget", String(parsedWeekly))
      localStorage.setItem("ft_needs_categories", JSON.stringify(needs))
      localStorage.setItem("ft_rule_pcts", JSON.stringify({ needs: rNeeds, wants: rWants, save: rSave }))
      toast.success("Tersimpan. Jalankan migrasi SQL agar permanen di DB.")
      onSettingsUpdated({ ...(currentSettings || {}), monthly_budget: parsedBudget, savings_target: parsedTarget, weekly_food_budget: parsedWeekly, needs_categories: needs, needs_pct: rNeeds, wants_pct: rWants, save_pct: rSave })
      onClose()
      return
    }

    setIsLoading(false)

    if (error) {
      console.error("Error updating settings:", error)
      toast.error("Gagal memperbarui pengaturan: " + error.message)
    } else {
      localStorage.setItem("ft_weekly_food_budget", String(parsedWeekly))
      localStorage.setItem("ft_needs_categories", JSON.stringify(needs))
      localStorage.setItem("ft_rule_pcts", JSON.stringify({ needs: rNeeds, wants: rWants, save: rSave }))
      toast.success("Pengaturan berhasil disimpan")
      onSettingsUpdated({ ...(currentSettings || {}), ...updatedSettings })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Target</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Batas Maksimal Pengeluaran Bulanan (Rp)</Label>
              <CurrencyInput
                value={budget}
                onChange={setBudget}
                placeholder="Contoh: 5.000.000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Target Tabungan Bulanan (Rp)</Label>
              <CurrencyInput
                value={target}
                onChange={setTarget}
                placeholder="Contoh: 1.000.000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Budget Makan & Nongkrong Mingguan (Rp)</Label>
              <CurrencyInput
                value={weeklyBudget}
                onChange={setWeeklyBudget}
                placeholder="Contoh: 500.000 (kosongi = belum diset)"
              />
            </div>

            <div className="space-y-2">
              <Label>Proporsi Needs / Wants / Save (%) — total harus 100</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={ruleNeeds}
                  onChange={(e) => setRuleNeeds(e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  aria-label="Persen Needs"
                />
                <Input
                  type="number"
                  value={ruleWants}
                  onChange={(e) => setRuleWants(e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  aria-label="Persen Wants"
                />
                <Input
                  type="number"
                  value={ruleSave}
                  onChange={(e) => setRuleSave(e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  aria-label="Persen Save"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori Needs — sisanya otomatis Wants</Label>
              <div className="grid grid-cols-2 gap-2">
                {NEEDS_OPTIONS.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={needs.includes(cat)}
                      onChange={() => toggleNeed(cat)}
                      className="h-4 w-4 accent-current"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
