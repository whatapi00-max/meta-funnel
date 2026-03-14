const supabase = require('../lib/supabase');

// List all marketers
async function listMarketers(req, res) {
  const { data, error } = await supabase
    .from('marketers')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch marketers' });
  }

  return res.json(data);
}

// Create a new marketer
async function createMarketer(req, res) {
  const { email, password, name, ref_code, whatsapp_number } = req.body;

  if (!email || !password || !name || !ref_code || !whatsapp_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(ref_code)) {
    return res.status(400).json({ error: 'Ref code must be 3-30 alphanumeric characters, hyphens, or underscores' });
  }

  if (!/^\d{10,15}$/.test(whatsapp_number)) {
    return res.status(400).json({ error: 'Invalid WhatsApp number' });
  }

  // Check if ref_code already exists
  const { data: existing } = await supabase
    .from('marketers')
    .select('id')
    .eq('ref_code', ref_code)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Ref code already taken' });
  }

  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Create user record
  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .insert({ auth_id: authUser.user.id, email, role: 'marketer' })
    .select()
    .single();

  if (userError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return res.status(500).json({ error: 'Failed to create user record' });
  }

  // Create marketer record
  const { data: marketer, error: marketerError } = await supabase
    .from('marketers')
    .insert({
      user_id: dbUser.id,
      name,
      ref_code,
      whatsapp_number,
      status: 'active',
    })
    .select()
    .single();

  if (marketerError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from('users').delete().eq('id', dbUser.id);
    return res.status(500).json({ error: 'Failed to create marketer record' });
  }

  return res.status(201).json(marketer);
}

// Update marketer
async function updateMarketer(req, res) {
  const { id } = req.params;
  const { name, whatsapp_number, status } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (whatsapp_number) {
    if (!/^\d{10,15}$/.test(whatsapp_number)) {
      return res.status(400).json({ error: 'Invalid WhatsApp number' });
    }
    updates.whatsapp_number = whatsapp_number;
  }
  if (status && ['active', 'pending', 'disabled'].includes(status)) {
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('marketers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update marketer' });
  }

  return res.json(data);
}

// Delete marketer
async function deleteMarketer(req, res) {
  const { id } = req.params;

  // Get user_id to also delete auth user
  const { data: marketer } = await supabase
    .from('marketers')
    .select('user_id, users(auth_id)')
    .eq('id', id)
    .single();

  if (!marketer) {
    return res.status(404).json({ error: 'Marketer not found' });
  }

  // Delete marketer (cascades to clicks)
  const { error } = await supabase.from('marketers').delete().eq('id', id);
  if (error) {
    return res.status(500).json({ error: 'Failed to delete marketer' });
  }

  // Delete user record and auth user
  if (marketer.user_id) {
    await supabase.from('users').delete().eq('id', marketer.user_id);
  }
  if (marketer.users?.auth_id) {
    await supabase.auth.admin.deleteUser(marketer.users.auth_id);
  }

  return res.json({ success: true });
}

// Get admin analytics
async function getAnalytics(req, res) {
  const { count: totalMarketers } = await supabase
    .from('marketers')
    .select('*', { count: 'exact', head: true });

  const { count: activeMarketers } = await supabase
    .from('marketers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalClicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayClicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentClicks } = await supabase
    .from('clicks')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const dailyClicks = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyClicks[d.toISOString().split('T')[0]] = 0;
  }

  (recentClicks || []).forEach((click) => {
    const day = click.created_at.split('T')[0];
    if (dailyClicks[day] !== undefined) dailyClicks[day]++;
  });

  const chartData = Object.entries(dailyClicks).map(([date, clicks]) => ({
    date,
    clicks,
  }));

  // Top marketers
  const { data: topMarketers } = await supabase
    .from('marketers')
    .select('name, ref_code, id')
    .eq('status', 'active')
    .limit(10);

  const topWithClicks = await Promise.all(
    (topMarketers || []).map(async (m) => {
      const { count } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('marketer_id', m.id);
      return { ...m, clicks: count || 0 };
    })
  );

  topWithClicks.sort((a, b) => b.clicks - a.clicks);

  return res.json({
    totalMarketers: totalMarketers || 0,
    activeMarketers: activeMarketers || 0,
    totalClicks: totalClicks || 0,
    todayClicks: todayClicks || 0,
    chartData,
    topMarketers: topWithClicks.slice(0, 5),
  });
}

// Update landing page content
async function updateLandingContent(req, res) {
  const { content } = req.body;

  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Content object required' });
  }

  const allowedKeys = [
    'headline', 'subheadline', 'prize_pool',
    'step_1_title', 'step_1_desc', 'step_2_title', 'step_2_desc',
    'step_3_title', 'step_3_desc', 'disclaimer',
    'whatsapp_message', 'default_whatsapp',
    'hero_image', 'cta_text',
    'site_name', 'logo_image',
    'stat_1_value', 'stat_1_label', 'stat_2_value', 'stat_2_label', 'stat_3_value', 'stat_3_label',
    'prize_1', 'prize_2', 'prize_3',
    'testimonial_1_name', 'testimonial_1_location', 'testimonial_1_text',
    'testimonial_2_name', 'testimonial_2_location', 'testimonial_2_text',
    'final_cta_title', 'final_cta_subtitle',
    'contact_email',
  ];

  const updates = Object.entries(content).filter(([key]) => allowedKeys.includes(key));

  for (const [key, value] of updates) {
    if (typeof value !== 'string' || value.length > 2000) continue;
    await supabase
      .from('landing_content')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }

  return res.json({ success: true });
}

// Upload hero image to Supabase Storage
async function uploadHeroImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = req.file.originalname.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ error: 'Only jpg, png, webp, gif allowed' });
  }

  // Auto-create the bucket if it doesn't exist yet
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'hero-images');
  if (!bucketExists) {
    const { error: bucketErr } = await supabase.storage.createBucket('hero-images', { public: true });
    if (bucketErr) {
      return res.status(500).json({ error: 'Could not create storage bucket: ' + bucketErr.message });
    }
  }

  const fileName = `hero-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('hero-images')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ error: 'Upload failed: ' + uploadError.message });
  }

  const { data: urlData } = supabase.storage
    .from('hero-images')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // Save the URL to landing_content
  await supabase
    .from('landing_content')
    .upsert({ key: 'hero_image', value: publicUrl }, { onConflict: 'key' });

  return res.json({ success: true, url: publicUrl });
}

// Upload logo image to Supabase Storage
async function uploadLogoImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = req.file.originalname.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ error: 'Only jpg, png, webp, gif, svg allowed' });
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'logo-images');
  if (!bucketExists) {
    const { error: bucketErr } = await supabase.storage.createBucket('logo-images', { public: true });
    if (bucketErr) {
      return res.status(500).json({ error: 'Could not create storage bucket: ' + bucketErr.message });
    }
  }

  const fileName = `logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('logo-images')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ error: 'Upload failed: ' + uploadError.message });
  }

  const { data: urlData } = supabase.storage
    .from('logo-images')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  await supabase
    .from('landing_content')
    .upsert({ key: 'logo_image', value: publicUrl }, { onConflict: 'key' });

  return res.json({ success: true, url: publicUrl });
}

module.exports = {
  listMarketers,
  createMarketer,
  updateMarketer,
  deleteMarketer,
  getAnalytics,
  updateLandingContent,
  uploadHeroImage,
  uploadLogoImage,
};
