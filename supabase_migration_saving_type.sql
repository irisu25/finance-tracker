-- Migrasi: tipe transaksi baru "saving" (TF nabung, cuma catatan, tidak mengurangi saldo)
-- Jalankan di Supabase SQL Editor sekali saja.
-- CHECK constraint bawaan bernama transactions_type_check (otomatis dari supabase_schema.sql).
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('income', 'expense', 'saving'));
