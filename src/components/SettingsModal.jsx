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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsModal({ isOpen, onClose, currentSettings, onSettingsUpdated, userId }) {
  const [budget, setBudget] = useState('')
  const [target, setTarget] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentSettings) {
      setBudget(currentSettings.monthly_budget || '')
      setTarget(currentSettings.savings_target || '')
    }
  }, [currentSettings, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parsedBudget = Number(budget)
    const parsedTarget = Number(target)
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      toast.error("Budget harus angka 0 atau lebih")
      return
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
      toast.error("Target tabungan harus angka 0 atau lebih")
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
      savings_target: parsedTarget
    }

    const { error } = await supabase
      .from('user_settings')
      .update(updatedSettings)
      .eq('user_id', userId)

    setIsLoading(false)

    if (error) {
      console.error("Error updating settings:", error)
      toast.error("Gagal memperbarui pengaturan: " + error.message)
    } else {
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
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Contoh: 5000000"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Target Tabungan Bulanan (Rp)</Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Contoh: 1000000"
                min="0"
                step="1"
                required
              />
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
