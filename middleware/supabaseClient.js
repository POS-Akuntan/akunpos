const { createClient } = require('@supabase/supabase-js');

// Inisialisasi client Supabase dengan URL dan Key dari environment variables
const supabase = createClient(
  process.env.SUPABASE, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
