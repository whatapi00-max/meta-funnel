const supabase = require('../lib/supabase');

// Get marketer's own profile
async function getProfile(req, res) {
  const { data, error } = await supabase
    .from('marketers')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Marketer profile not found' });
  }

  return res.json(data);
}

// Update WhatsApp number(s)
async function updateWhatsApp(req, res) {
  const { whatsapp_number, whatsapp_number_2 } = req.body;

  if (!whatsapp_number || !/^\d{10,15}$/.test(whatsapp_number)) {
    return res.status(400).json({ error: 'Invalid WhatsApp number. Use digits only (10-15 digits).' });
  }

  if (whatsapp_number_2 && !/^\d{10,15}$/.test(whatsapp_number_2)) {
    return res.status(400).json({ error: 'Invalid WhatsApp number 2. Use digits only (10-15 digits).' });
  }

  const updates = { whatsapp_number, status: 'pending' };
  if (whatsapp_number_2 !== undefined) {
    updates.whatsapp_number_2 = whatsapp_number_2 || '';
  }

  const { data, error } = await supabase
    .from('marketers')
    .update(updates)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update number' });
  }

  return res.json({ success: true, marketer: data });
}

// Get marketer's click stats
async function getStats(req, res) {
  const { data: marketer } = await supabase
    .from('marketers')
    .select('id, ref_code')
    .eq('user_id', req.user.id)
    .single();

  if (!marketer) {
    return res.status(404).json({ error: 'Marketer not found' });
  }

  // Total clicks
  const { count: totalClicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .eq('marketer_id', marketer.id);

  // Today's clicks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayClicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .eq('marketer_id', marketer.id)
    .gte('created_at', today.toISOString());

  // Last 7 days breakdown
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentClicks } = await supabase
    .from('clicks')
    .select('created_at')
    .eq('marketer_id', marketer.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Group by day
  const dailyClicks = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyClicks[key] = 0;
  }

  (recentClicks || []).forEach((click) => {
    const day = click.created_at.split('T')[0];
    if (dailyClicks[day] !== undefined) {
      dailyClicks[day]++;
    }
  });

  const chartData = Object.entries(dailyClicks).map(([date, clicks]) => ({
    date,
    clicks,
  }));

  return res.json({
    totalClicks: totalClicks || 0,
    todayClicks: todayClicks || 0,
    chartData,
  });
}

module.exports = { getProfile, updateWhatsApp, getStats };
