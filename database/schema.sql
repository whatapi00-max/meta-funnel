-- ============================================
-- Meta Funnel - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'marketer' CHECK (role IN ('admin', 'marketer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Marketers table
-- ============================================
CREATE TABLE IF NOT EXISTS public.marketers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ref_code TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Clicks tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketer_id UUID REFERENCES public.marketers(id) ON DELETE CASCADE,
  ref_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Landing page content (admin-editable)
-- ============================================
CREATE TABLE IF NOT EXISTS public.landing_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Insert default landing page content
-- (Meta-ads safe, conversion-focused defaults)
-- ============================================
INSERT INTO public.landing_content (key, value) VALUES
  ('headline', 'Join Our Exclusive WhatsApp Community'),
  ('subheadline', 'Get daily tips, rewards & exclusive content delivered straight to your WhatsApp.'),
  ('prize_pool', ''),
  ('step_1_title', 'Instant Access'),
  ('step_1_desc', 'Tap the button — you''re in. No forms, no waiting.'),
  ('step_2_title', 'Exclusive Rewards'),
  ('step_2_desc', 'Daily prizes, offers & content you won''t find anywhere else.'),
  ('step_3_title', '100% Free & Safe'),
  ('step_3_desc', 'Your privacy matters. Leave anytime, zero spam guaranteed.'),
  ('disclaimer', 'This page is for informational purposes. By joining, you agree to receive messages on WhatsApp. You can leave the group at any time. We respect your privacy and will never share your information.'),
  ('whatsapp_message', 'Hi, I want to join'),
  ('default_whatsapp', '919876543210'),
  ('contact_email', 'support@mobsforsub.com'),
  ('site_name', 'MobsForSub'),
  ('logo_image', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_marketers_ref_code ON public.marketers(ref_code);
CREATE INDEX IF NOT EXISTS idx_clicks_marketer_id ON public.clicks(marketer_id);
CREATE INDEX IF NOT EXISTS idx_clicks_ref_code ON public.clicks(ref_code);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON public.clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Users: admins read all, users read own
DROP POLICY IF EXISTS "Admins read all users" ON public.users;
CREATE POLICY "Admins read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Users read own record" ON public.users;
CREATE POLICY "Users read own record" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Marketers: public can read active marketers (for landing page)
DROP POLICY IF EXISTS "Public read active marketers" ON public.marketers;
CREATE POLICY "Public read active marketers" ON public.marketers
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage marketers" ON public.marketers;
CREATE POLICY "Admins manage marketers" ON public.marketers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Marketers update own record" ON public.marketers;
CREATE POLICY "Marketers update own record" ON public.marketers
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Clicks: open insert (for tracking), restricted read
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
CREATE POLICY "Anyone can insert clicks" ON public.clicks
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read all clicks" ON public.clicks;
CREATE POLICY "Admins read all clicks" ON public.clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Marketers read own clicks" ON public.clicks;
CREATE POLICY "Marketers read own clicks" ON public.clicks
  FOR SELECT USING (
    marketer_id IN (
      SELECT m.id FROM public.marketers m
      JOIN public.users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Landing content: public read, admin write
DROP POLICY IF EXISTS "Public read landing content" ON public.landing_content;
CREATE POLICY "Public read landing content" ON public.landing_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage landing content" ON public.landing_content;
CREATE POLICY "Admins manage landing content" ON public.landing_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
  );
