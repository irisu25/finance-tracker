import React, { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function TransactionModal({ isOpen, onClose, onTransactionAdded, userId }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!amount || !category || !date || !note) {
      toast.error("Mohon lengkapi semua data wajib")
      setIsLoading(false)
      return
    }

    if (!supabase) {
        toast.error("Supabase client belum terkonfigurasi. Pastikan .env sudah benar.")
        setIsLoading(false)
        return
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ amount: parseFloat(amount), type, category, date, note, user_id: userId }])
      .select()

    setIsLoading(false)

    if (error) {
      console.error("Error inserting transaction:", error)
      toast.error("Gagal menyimpan transaksi: " + error.message)
    } else {
      toast.success("Transaksi berhasil ditambahkan")
      setAmount('')
      setCategory('')
      setNote('')
      onTransactionAdded(data[0])
      onClose()
    }
  }

  const expenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
  const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya']
  const categories = type === 'expense' ? expenseCategories : incomeCategories

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Type Toggle */}
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
            >
              Pemasukan
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="dark:[color-scheme:dark]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Judul Transaksi</Label>
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Makan Nasi Padang"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
