-- Migrasi: budget makan/nongkrong mingguan + mapping Needs 50/30/20 (manual, tersimpan di DB)
-- Jalankan di Supabase SQL Editor sekali saja.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS weekly_food_budget NUMERIC DEFAULT 0;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS needs_categories TEXT[] DEFAULT '{Makanan,Transportasi}';

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS needs_pct NUMERIC DEFAULT 50;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS wants_pct NUMERIC DEFAULT 30;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS save_pct NUMERIC DEFAULT 20;
