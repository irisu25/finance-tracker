import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Wallet } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success("Berhasil login!")
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success("Berhasil mendaftar! Cek email untuk konfirmasi (jika diaktifkan), atau langsung login.")
      }
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">{isLogin ? 'Selamat Datang' : 'Buat Akun'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Masuk ke akun Finance Tracker Anda.' : 'Mulai kendalikan keuangan Anda hari ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
        </CardContent>
      </Card>
    </div>
  )
}
