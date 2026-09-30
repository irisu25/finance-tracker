# Finance Tracker

Web app buat nyatet pemasukan, pengeluaran, tabungan, dan PO merch bulanan. Mobile-first, bisa diinstall ke HP (PWA), multi-user pake Supabase Auth.

## Fitur

**Transaksi**
- Catat pemasukan, pengeluaran, dan TF nabung (tipe `saving`, cuma catatan — tidak mengurangi saldo)
- Edit & hapus transaksi (hapus pake konfirmasi)
- Search judul/kategori, filter kategori, sort (terbaru/terlama/nominal), pagination 10/halaman
- Export CSV (ngikutin filter & sort yang aktif)
- Input Rupiah auto-format ribuan + chip nominal cepat (10/25/50/100rb)

**Dashboard**
- Ringkasan saldo, pemasukan, pengeluaran (saldo bisa disembunyikan)
- Navigasi section sticky: Ringkasan / Target / Insight / Riwayat
- Target: batas budget bulanan + target tabungan bulanan (vs total TF nabung bulan ini)
- Insight: aturan bagi pemasukan custom (default 50/30/20, persen & mapping Needs bisa diatur), budget makan & nongkrong mingguan (Senin–Minggu), streak no-spend day
- Grafik pie pengeluaran (lazy-load, tidak membebani bundle awal)

**PO Merch**
- Catat barang PO, DP, cicilan, sisa tagihan + progress bar
- Status lunas otomatis

**Lainnya**
- Mode gelap, proteksi privasi saldo, toggle lihat password
- Multi-user (Supabase Auth, data misah per user)

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4 + shadcn/ui + Base UI
- Supabase (PostgreSQL + Auth)
- Recharts (lazy-load, chunk terpisah)
- Sonner (toast), Lucide (ikon), vite-plugin-pwa

## Cara Install

1. Clone & install

```bash
git clone https://github.com/irisu25/finance-tracker.git
cd finance-tracker
npm install
```

2. Setup Supabase

Buat project di [Supabase](https://supabase.com), lalu jalankan file SQL ini **berurutan** di SQL Editor:

1. `supabase_schema.sql` — tabel dasar
2. `supabase_migration_weekly_budget.sql` — kolom budget mingguan, mapping Needs, persen aturan
3. `supabase_migration_saving_type.sql` — tipe transaksi `saving` (TF nabung)

> Catatan: pastikan RLS membatasi data per user (`auth.uid() = user_id`), bukan akses publik. Kalau simpan TF nabung ditolak database, berarti migrasi nomor 3 belum dijalankan.

3. Bikin file `.env`

```env
VITE_SUPABASE_URL=url_supabase_kamu
VITE_SUPABASE_ANON_KEY=anon_key_supabase_kamu
```

4. Jalanin

```bash
npm run dev      # development
npm run build    # production (output ke dist/)
npm run preview  # coba hasil build
npm run lint     # cek kode (oxlint, harus 0 error)
```

## Struktur Proyek

```
src/
  App.jsx                 # dashboard, riwayat, insight, section nav
  supabaseClient.js       # client Supabase (null kalau .env kosong)
  components/
    TransactionModal.jsx  # tambah/edit pemasukan, pengeluaran, nabung
    SettingsModal.jsx     # budget, target, mapping Needs, persen aturan
    AuthModal.jsx         # login/daftar
    POMerch.jsx           # tracker PO merch
    CurrencyInput.jsx     # input Rupiah auto-format
    ExpenseChart.jsx      # pie chart (lazy-load)
    ui/                   # komponen shadcn/ui
supabase_schema.sql
supabase_migration_weekly_budget.sql
supabase_migration_saving_type.sql
```
