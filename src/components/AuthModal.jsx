import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Wallet, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function AuthModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLogin(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }, [isOpen])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success("Berhasil login!")
        onClose()
      } else {
        if (password.length < 8) {
          toast.error("Password harus minimal 8 karakter")
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          toast.error("Konfirmasi password tidak cocok")
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success("Berhasil mendaftar! Anda telah otomatis masuk.")
        onClose()
      }
    } catch (error) {
      toast.error("Email atau password salah/tidak valid.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <DialogTitle className="text-2xl">{isLogin ? 'Selamat Datang' : 'Buat Akun'}</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Masuk ke akun Finance Tracker Anda.' : 'Mulai kendalikan keuangan Anda hari ini.'}
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isLogin && (
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Konfirmasi Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-xs text-muted-foreground" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
