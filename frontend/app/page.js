'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '../lib/api';

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const DEFAULT_CARDS = [
  { id: '1', label: 'IPL 2025', sub: 'MI vs CSK - Live Now', icon: '\u{1F3CF}', badge: 'LIVE', badgeColor: '#ef4444', gradient: 'linear-gradient(135deg, #1a0505 0%, #7c2d12 50%, #c2410c 100%)', image: '', odds: '2.45x', order: 1 },
  { id: '2', label: 'Football', sub: 'UEFA Champions League', icon: '\u26BD', badge: 'HOT', badgeColor: '#22c55e', gradient: 'linear-gradient(135deg, #021a0a 0%, #052e16 50%, #166534 100%)', image: '', odds: '1.95x', order: 2 },
  { id: '3', label: 'Tennis', sub: 'Grand Slam - AO 2026', icon: '\u{1F3BE}', badge: 'NEW', badgeColor: '#3b82f6', gradient: 'linear-gradient(135deg, #0a0520 0%, #1e1b4b 50%, #3730a3 100%)', image: '', odds: '3.10x', order: 3 },
  { id: '4', label: 'Crash Plane', sub: 'Fly high - Take off', icon: '\u2708\uFE0F', badge: 'LIVE', badgeColor: '#ef4444', gradient: 'linear-gradient(135deg, #0a0500 0%, #200d00 50%, #7c2d00 100%)', image: '', odds: '\u221E', order: 4 },
];

function pickRandomUrl(urls) {
  if (!urls || urls.length === 0) return '#';
  return urls[Math.floor(Math.random() * urls.length)];
}

function GameCard({ card, waUrls }) {
  const url = pickRandomUrl(waUrls);
  const hasImage = card.image && card.image.trim() !== '';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative w-full block active:scale-[0.98] transition-transform"
      style={{ height: 80 }}
    >
      {/* Card body — overflow hidden kept here so image clips to rounded corners */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ background: hasImage ? 'none' : card.gradient }}
      >
        {hasImage && (
          <img src={card.image} alt={card.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        {!hasImage && (
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.55) 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-between px-5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none">{card.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-black text-sm leading-none">{card.label}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white leading-none" style={{ background: card.badgeColor }}>{card.badge}</span>
                  </div>
                  <p className="text-white/65 text-[10px] mt-0.5 font-medium">{card.sub}</p>
                </div>
              </div>
              <div className="text-right mr-10">
                <div className="text-white font-black text-xl tabular-nums">{card.odds}</div>
                <div className="join-blink text-white text-[9px] font-black uppercase tracking-wide">Join Now</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* JOIN button — premium pill on center bottom */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full select-none"
        style={{
          background: `linear-gradient(135deg, ${card.badgeColor}ee 0%, ${card.badgeColor}99 100%)`,
          boxShadow: `0 0 18px 4px ${card.badgeColor}55, inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 10px rgba(0,0,0,0.6)`,
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <span className="text-white font-black text-[10px] uppercase tracking-widest leading-none">Join</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </span>
    </a>
  );
}

const CACHE_KEY = 'mf_content_v2';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 min — discard truly ancient cache

function applyContent(c, m, setContent, setCards, setWaUrls) {
  setContent(c);
  if (c.game_cards) {
    try {
      const parsed = JSON.parse(c.game_cards);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCards(parsed.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch { /* use defaults */ }
  }
  const msg = encodeURIComponent(c.whatsapp_message || 'Hi, I want to join');
  const numbers = [];
  const n1 = m?.whatsapp_number || c.default_whatsapp || '919876543210';
  numbers.push('https://wa.me/' + n1 + '?text=' + msg);
  if (m?.whatsapp_number_2) {
    numbers.push('https://wa.me/' + m.whatsapp_number_2 + '?text=' + msg);
  }
  setWaUrls(numbers);
}

function LandingContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [waUrls, setWaUrls] = useState([]);
  const [content, setContent] = useState(null);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function load() {
      // Always try cache first — ANY cached data beats a spinner
      let hasCachedData = false;
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          const age = Date.now() - ts;
          if (age < CACHE_MAX_AGE) {
            // Show cached content immediately — no spinner
            applyContent(data, null, setContent, setCards, setWaUrls);
            hasCachedData = true;
            setLoaded(true);
            setTimeout(() => setVisible(true), 30);
          }
        }
      } catch { /* localStorage not available */ }

      // Always fetch fresh in background (wakes up Render, updates content)
      try {
        const [c, m] = await Promise.all([
          publicApi.getContent(),
          ref ? publicApi.getMarketer(ref) : Promise.resolve(null),
        ]);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: c, ts: Date.now() })); } catch {}
        applyContent(c, m, setContent, setCards, setWaUrls);
        if (ref) publicApi.trackClick(ref).catch(() => {});
      } catch {
        if (!hasCachedData) {
          // No cache AND fetch failed — use hardcoded fallback
          const msg = encodeURIComponent('Hi, I want to join');
          setWaUrls(['https://wa.me/919876543210?text=' + msg]);
        }
      } finally {
        if (!hasCachedData) {
          setLoaded(true);
          setTimeout(() => setVisible(true), 30);
        }
      }
    }
    load();
  }, [ref]);

  const ctaLabel = content?.cta_text || 'Join Free on WhatsApp';
  const contactEmail = content?.contact_email || 'support@billy777.com';
  const mainUrl = pickRandomUrl(waUrls);

  if (!loaded) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1b2a 25%, #0f2740 50%, #0a1628 75%, #050510 100%)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#25D366] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1b2a 25%, #0f2740 50%, #0a1628 75%, #050510 100%)' }}>
      <div className={`relative z-10 min-h-screen min-h-dvh flex flex-col items-center justify-between px-5 py-6 max-w-lg mx-auto transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {content?.logo_image ? (
              <img src={content.logo_image} alt="logo" className="w-6 h-6 rounded-md object-contain" />
            ) : (
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-xs">{'\u{1F3C6}'}</div>
            )}
            <span className="text-white font-extrabold text-lg tracking-tight">{content?.site_name || 'Billy777'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span className="text-[11px] text-green-300 font-semibold">LIVE</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-2">

          {/* Game Cards */}
          <div className="w-full max-w-sm mx-auto mb-5 flex flex-col gap-5">
            {cards.map((card) => (
              <GameCard key={card.id} card={card} waUrls={waUrls} />
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-center mb-2">
            <span className="block text-3xl sm:text-4xl font-black text-transparent bg-clip-text leading-tight" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #25D366 100%)' }}>
              {content?.headline || 'Skill Play & Get Rewards'}
            </span>
          </h1>

          {/* Feature tagline */}
          <p className="text-white/70 text-center text-[13px] font-semibold mb-3 max-w-xs leading-snug">
            India&apos;s #1 Sports &amp; Gaming community - Get instant support, Play Games &amp; Join 1600+ games on WhatsApp!
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {[
              { icon: '✈️', label: 'Fly Challenge' },
              { icon: '🏏', label: 'Cricket Live' },
              { icon: '⏰', label: 'Instant Support 24x7' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[12px] text-white/80 font-semibold backdrop-blur-sm">
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <div className="w-full max-w-sm">
            <a
              href={mainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-lg text-white transition-all duration-300 active:scale-[0.97] cta-mega-glow overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
            >
              <div className="absolute inset-0 cta-shine" />
              <span className="relative z-10 flex items-center gap-3">
                {WA_SVG}
                <span>{ctaLabel}</span>
                <span className="text-xl bounce-x">{'\u2192'}</span>
              </span>
            </a>

            <div className="flex items-center justify-center gap-4 mt-4">
              {['Join Now', 'No Spam', 'Leave Anytime'].map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] text-white/35 font-medium">
                  <svg className="w-3 h-3 text-green-400/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full mt-6 space-y-3">
          <div className="flex items-center justify-center gap-3 text-[10px]">
            <Link href="/privacy" className="text-white/20 hover:text-white/40 transition-colors">Privacy</Link>
            <span className="text-white/10">{'\u00B7'}</span>
            <Link href="/terms" className="text-white/20 hover:text-white/40 transition-colors">Terms</Link>
            <span className="text-white/10">{'\u00B7'}</span>
            <Link href="/disclaimer" className="text-white/20 hover:text-white/40 transition-colors">Disclaimer</Link>
            <span className="text-white/10">{'\u00B7'}</span>
            <a href={'mailto:' + contactEmail} className="text-white/20 hover:text-white/40 transition-colors">{contactEmail}</a>
          </div>
          <p className="text-[9px] text-white/15 text-center leading-relaxed max-w-xs mx-auto">
            {content?.disclaimer || 'Independent fan community on WhatsApp. Not affiliated with Meta, WhatsApp, or Instagram.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a1a' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#25D366] border-t-transparent" />
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}