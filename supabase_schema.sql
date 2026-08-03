-- Hapus tabel jika sudah ada (opsional, hati-hati jika ada data)
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS user_settings;

-- 1. Buat tabel transactions
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT
);

-- 2. Buat tabel user_settings untuk menyimpan target dan limit
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  monthly_budget NUMERIC DEFAULT 5000000,
  savings_target NUMERIC DEFAULT 1000000,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 3. Masukkan baris default untuk user_settings
INSERT INTO user_settings (id, monthly_budget, savings_target) 
VALUES (1, 5000000, 1000000)
ON CONFLICT (id) DO NOTHING;

-- 4. Setup Row Level Security (RLS) 
-- Karena ini MVP tanpa autentikasi, kita set public bisa baca dan tulis.
-- PENTING: Jika aplikasi sudah ada fitur login, ubah kebijakan ini!
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on transactions" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow public read access on user_settings" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update access on user_settings" ON user_settings FOR UPDATE USING (true);
