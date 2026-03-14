const supabase = require('../lib/supabase');

// Get marketer by ref code (public)
async function getMarketerByRef(req, res) {
  const { ref } = req.params;

  if (!ref || typeof ref !== 'string' || ref.length > 50) {
    return res.status(400).json({ error: 'Invalid ref code' });
  }

  const { data, error } = await supabase
    .from('marketers')
    .select('name, whatsapp_number, ref_code')
    .eq('ref_code', ref)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    // Return default number from landing content
    const { data: defaultContent } = await supabase
      .from('landing_content')
      .select('value')
      .eq('key', 'default_whatsapp')
      .single();

    return res.json({
      found: false,
      whatsapp_number: defaultContent?.value || process.env.DEFAULT_WHATSAPP,
    });
  }

  return res.json({ found: true, ...data });
}

// Track click (public)
async function trackClick(req, res) {
  const { ref } = req.params;

  if (!ref || typeof ref !== 'string' || ref.length > 50) {
    return res.status(400).json({ error: 'Invalid ref code' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent']?.substring(0, 500) || '';

  // Find marketer
  const { data: marketer } = await supabase
    .from('marketers')
    .select('id')
    .eq('ref_code', ref)
    .eq('status', 'active')
    .single();

  if (!marketer) {
    return res.status(404).json({ error: 'Marketer not found' });
  }

  const { error } = await supabase.from('clicks').insert({
    marketer_id: marketer.id,
    ref_code: ref,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    return res.status(500).json({ error: 'Failed to track click' });
  }

  return res.json({ success: true });
}

// Get landing page content (public)
async function getLandingContent(req, res) {
  const { data, error } = await supabase
    .from('landing_content')
    .select('key, value');

  if (error) {
    return res.status(500).json({ error: 'Failed to load content' });
  }

  const content = {};
  data.forEach((row) => {
    content[row.key] = row.value;
  });

  return res.json(content);
}

module.exports = { getMarketerByRef, trackClick, getLandingContent };
