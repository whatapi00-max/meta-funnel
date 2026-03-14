require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = 'admin@mobsforsub.com';
const NEW_PASSWORD = 'Admin@12345';

async function run() {
  // Find the user
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error('List error:', listErr.message); process.exit(1); }

  const user = users.find(u => u.email === ADMIN_EMAIL);
  if (!user) { console.error('User not found in auth.users'); process.exit(1); }

  console.log('Found user:', user.id);

  // Reset password
  const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: NEW_PASSWORD,
    email_confirm: true,
  });
  if (updateErr) { console.error('Update error:', updateErr.message); process.exit(1); }

  console.log('Password reset successfully!');
  console.log('Email:   ', ADMIN_EMAIL);
  console.log('Password:', NEW_PASSWORD);

  // Ensure public.users row exists with admin role
  const { error: upsertErr } = await supabase
    .from('users')
    .upsert({ auth_id: user.id, email: ADMIN_EMAIL, role: 'admin' }, { onConflict: 'auth_id' });
  if (upsertErr) { console.error('DB upsert error:', upsertErr.message); }
  else console.log('DB record confirmed: role=admin');
}

run();
