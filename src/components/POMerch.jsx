import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

export default function POMerch({ session }) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Form add item
  const [itemName, setItemName] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form payment
  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    if (session) {
      fetchItems()
    } else {
      setItems([])
      setIsLoading(false)
    }
  }, [session])

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('preorders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Gagal mengambil data PO')
    } else {
      setItems(data)
    }
    setIsLoading(false)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newItem = {
      item_name: itemName,
      total_price: Number(totalPrice),
      paid_amount: Number(paidAmount || 0),
      user_id: session.user.id
    }

    const { error } = await supabase.from('preorders').insert([newItem])
    
    if (error) {
      toast.error('Gagal menambah PO')
    } else {
      toast.success('PO berhasil ditambahkan!')
      setIsModalOpen(false)
      setItemName('')
      setTotalPrice('')
      setPaidAmount('')
      fetchItems()
    }
    setIsSubmitting(false)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const newPaidAmount = selectedItem.paid_amount + Number(paymentAmount)
    const finalPaid = Math.min(newPaidAmount, selectedItem.total_price)
    
    const { error } = await supabase
      .from('preorders')
      .update({ paid_amount: finalPaid })
      .eq('id', selectedItem.id)
      
    if (error) {
      toast.error('Gagal menyimpan pembayaran')
    } else {
      toast.success('Pembayaran berhasil dicatat!')
      setIsPaymentModalOpen(false)
      setPaymentAmount('')
      fetchItems()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus item PO ini?')) return
    const { error } = await supabase.from('preorders').delete().eq('id', id)
    if (error) {
      toast.error('Gagal menghapus item')
    } else {
      toast.success('Item dihapus')
      fetchItems()
    }
  }

  const totalUnpaid = items.reduce((acc, curr) => acc + (curr.total_price - curr.paid_amount), 0)
  const activeItems = items.filter(item => item.paid_amount < item.total_price).length

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">Silakan Login</h2>
        <p className="text-muted-foreground">Anda harus login untuk mencatat PO Merch.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sisa Tagihan PO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">{formatIDR(totalUnpaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">Harus dilunasi dari {activeItems} item aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight">Daftar PO Saya</h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah PO
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">Belum ada PO yang dicatat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const progress = Math.min((item.paid_amount / item.total_price) * 100, 100)
            const isLunas = item.paid_amount >= item.total_price
            
            return (
              <Card key={item.id} className={`overflow-hidden transition-all ${isLunas ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base font-semibold">{item.item_name}</CardTitle>
                    <CardDescription className="mt-1 font-mono">{formatIDR(item.total_price)}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Terbayar: {formatIDR(item.paid_amount)}</span>
                      <span className={isLunas ? 'text-emerald-500 font-medium' : 'text-primary font-medium'}>
                        {isLunas ? 'Lunas!' : `Sisa: ${formatIDR(item.total_price - item.paid_amount)}`}
                      </span>
                    </div>
                    <Progress value={progress} className={`h-2 ${isLunas ? '[&>div]:bg-emerald-500' : ''}`} />
                  </div>
                  
                  {!isLunas && (
                    <Button 
                      variant="outline" 
                      className="w-full h-8 text-xs" 
                      onClick={() => {
                        setSelectedItem(item)
                        setIsPaymentModalOpen(true)
                      }}
                    >
                      <CreditCard className="w-3 h-3 mr-2" />
                      Bayar Cicilan / Lunas
                    </Button>
                  )}
                  {isLunas && (
                    <div className="flex items-center justify-center text-xs font-medium text-emerald-500 bg-emerald-500/10 py-1.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> PO Selesai
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Tambah PO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah PO Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Barang / Merch</Label>
              <Input required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Contoh: Nendoroid Miku" />
            </div>
            <div className="space-y-2">
              <Label>Total Harga (Rp)</Label>
              <Input type="number" required value={totalPrice} onChange={e => setTotalPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Sudah Dibayar (DP) (Rp)</Label>
              <Input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0 (Kosongi jika belum DP)" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan PO'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Bayar PO */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bayar PO: {selectedItem?.item_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4 pt-4">
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Harga:</span>
                <span className="font-mono">{selectedItem && formatIDR(selectedItem.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa Tagihan:</span>
                <span className="font-mono font-medium text-primary">
                  {selectedItem && formatIDR(selectedItem.total_price - selectedItem.paid_amount)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nominal Pembayaran (Rp)</Label>
              <Input type="number" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Masukkan nominal" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Catat Pembayaran'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
