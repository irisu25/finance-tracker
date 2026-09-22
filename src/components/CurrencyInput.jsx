import { Input } from "@/components/ui/input"

const MAX_DIGITS = 15

// Input Rupiah: tampil pemisah ribuan (50.000) saat ketik,
// nilai mentah (digit saja, "50000") diteruskan ke onChange.
export default function CurrencyInput({ value, onChange, ...rest }) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, MAX_DIGITS)
  const text = digits ? Number(digits).toLocaleString('id-ID') : ''

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="Contoh: 50.000"
      {...rest}
      value={text}
      onChange={(e) => onChange?.(e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS))}
    />
  )
}
