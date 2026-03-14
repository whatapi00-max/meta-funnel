const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

// Auth client — used only for signInWithPassword (anon key)
const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// DB client — service role, bypasses RLS entirely, never has a user session
const dbClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Authenticate with the anon client so the service client stays clean
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Query DB with service role (bypasses RLS, no recursion issue)
  const { data: dbUser } = await dbClient
    .from('users')
    .select('*')
    .eq('auth_id', data.user.id)
    .single();

  if (!dbUser) {
    return res.status(401).json({ error: 'User record not found' });
  }

  const token = jwt.sign(
    { sub: data.user.id, role: dbUser.role, email: dbUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: { id: dbUser.id, email: dbUser.email, role: dbUser.role },
  });
}

// Signup (creates marketer accounts)
async function signup(req, res) {
  const { email, password, name, ref_code, whatsapp_number } = req.body;

  if (!email || !password || !name || !ref_code || !whatsapp_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(ref_code)) {
    return res.status(400).json({ error: 'Ref code: 3-30 alphanumeric characters, hyphens, or underscores' });
  }

  if (!/^\d{10,15}$/.test(whatsapp_number)) {
    return res.status(400).json({ error: 'Invalid WhatsApp number (10-15 digits)' });
  }

  // Check ref_code uniqueness
  const { data: existing } = await dbClient
    .from('marketers')
    .select('id')
    .eq('ref_code', ref_code)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Ref code already taken' });
  }

  // Create auth user
  const { data: authData, error: authError } = await dbClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Create db user
  const { data: dbUser, error: userError } = await dbClient
    .from('users')
    .insert({ auth_id: authData.user.id, email, role: 'marketer' })
    .select()
    .single();

  if (userError) {
    await dbClient.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: 'Failed to create user' });
  }

  // Create marketer
  const { error: marketerError } = await dbClient
    .from('marketers')
    .insert({
      user_id: dbUser.id,
      name,
      ref_code,
      whatsapp_number,
      status: 'pending',
    });

  if (marketerError) {
    await dbClient.auth.admin.deleteUser(authData.user.id);
    await dbClient.from('users').delete().eq('id', dbUser.id);
    return res.status(500).json({ error: 'Failed to create marketer profile' });
  }

  const token = jwt.sign(
    { sub: authData.user.id, role: 'marketer', email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    token,
    user: { id: dbUser.id, email, role: 'marketer' },
  });
}

module.exports = { login, signup };
