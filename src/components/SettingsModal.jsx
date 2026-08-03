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

export default function SettingsModal({ isOpen, onClose, currentSettings, onSettingsUpdated }) {
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
    setIsLoading(true)

    if (!budget || !target) {
      toast.error("Mohon isi kedua target")
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
      toast.error("Gagal memperbarui pengaturan: " + error.message)
    } else {
      toast.success("Pengaturan berhasil disimpan")
      onSettingsUpdated(updatedSettings)
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
