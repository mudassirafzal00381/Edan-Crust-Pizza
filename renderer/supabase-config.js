// ══════════════════════════════════════════════════════════════════════════════
// ⚡ EDEN'S CRUST PIZZA — SUPABASE CLOUD DATABASE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
// To synchronize data live across ALL PC & Mobile devices:
// 1. Create a free project at https://supabase.com
// 2. Paste the SQL code from `supabase_schema.sql` in Supabase SQL Editor and click RUN
// 3. Paste your Supabase Project URL and Anon API Key below (or configure via the POS app "☁️ Cloud Sync" button):

const rawUrl = window.SUPABASE_URL || "https://vkteztnmqjcaudvgpghd.supabase.co";
window.SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
window.SUPABASE_KEY = window.SUPABASE_KEY || "sb_publishable_4Kvv1Ad2oVKa5T47M2euTA_vwz5G0xy";
