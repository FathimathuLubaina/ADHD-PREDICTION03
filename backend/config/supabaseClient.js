require('dotenv').config(); // load environment variables

const { createClient } = require('@supabase/supabase-js');

// Uses service role key so the app can read/write required rows for this project.
// In production, store secrets in your hosting provider environment variables.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;

