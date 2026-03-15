'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { adminApi, publicApi } from '../../../lib/api';

const DEFAULT_CARDS = [
  { id: '1', label: 'IPL 2025', sub: 'MI vs CSK - Live Now', icon: '\u{1F3CF}', badge: 'LIVE', badgeColor: '#ef4444', gradient: 'linear-gradient(135deg, #1a0505 0%, #7c2d12 50%, #c2410c 100%)', image: '', odds: '2.45x', order: 1 },
  { id: '2', label: 'Football', sub: 'UEFA Champions League', icon: '\u26BD', badge: 'HOT', badgeColor: '#22c55e', gradient: 'linear-gradient(135deg, #021a0a 0%, #052e16 50%, #166534 100%)', image: '', odds: '1.95x', order: 2 },
  { id: '3', label: 'Tennis', sub: 'Grand Slam - AO 2026', icon: '\u{1F3BE}', badge: 'NEW', badgeColor: '#3b82f6', gradient: 'linear-gradient(135deg, #0a0520 0%, #1e1b4b 50%, #3730a3 100%)', image: '', odds: '3.10x', order: 3 },
  { id: '4', label: 'Crash Plane', sub: 'Fly high - Take off', icon: '\u2708\uFE0F', badge: 'LIVE', badgeColor: '#ef4444', gradient: 'linear-gradient(135deg, #0a0500 0%, #200d00 50%, #7c2d00 100%)', image: '', odds: '\u221E', order: 4 },
];

export default function AdminSettings() {
  const [content, setContent] = useState({});
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [cardUploading, setCardUploading] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await publicApi.getContent();
        setContent(data);
        if (data.game_cards) {
          try {
            const parsed = JSON.parse(data.game_cards);
            if (Array.isArray(parsed) && parsed.length > 0) setCards(parsed);
          } catch {}
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const saveContent = { ...content, game_cards: JSON.stringify(cards) };
      await adminApi.updateContent(saveContent);
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key, value) {
    setContent({ ...content, [key]: value });
  }

  function updateCard(index, field, value) {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  }

  function addCard() {
    const id = String(Date.now());
    setCards([...cards, { id, label: 'New Game', sub: 'Description', icon: '\u{1F3AE}', badge: 'NEW', badgeColor: '#3b82f6', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', image: '', odds: '1.00x', order: cards.length + 1 }]);
  }

  function removeCard(index) {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  }

  async function handleCardImageUpload(index, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardUploading(index);
    setError('');
    try {
      const result = await adminApi.uploadCardImage(file);
      const updatedCards = [...cards];
      updatedCards[index] = { ...updatedCards[index], image: result.url };
      setCards(updatedCards);
      // Auto-save so the image is immediately live on the landing page
      const saveContent = { ...content, game_cards: JSON.stringify(updatedCards) };
      await adminApi.updateContent(saveContent);
      setSuccess('Card image uploaded and saved!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Card image upload failed');
    } finally {
      setCardUploading(null);
    }
  }

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.uploadHeroImage(file);
      handleChange('hero_image', result.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const result = await adminApi.uploadLogoImage(file);
      handleChange('logo_image', result.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Landing Page Settings</h1>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSave}>
        <div className="space-y-6">

          {/* Branding */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input type="text" value={content.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} className="input-field" placeholder="Billy777" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  {logoUploading ? 'Uploading...' : 'Choose Logo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                {content.logo_image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={content.logo_image} alt="Logo" className="h-10 w-10 rounded-lg object-contain border bg-gray-50" />
                    <button type="button" onClick={() => handleChange('logo_image', '')} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input type="text" value={content.headline || ''} onChange={(e) => handleChange('headline', e.target.value)} className="input-field" placeholder="Play & Win Prizes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                <input type="text" value={content.subheadline || ''} onChange={(e) => handleChange('subheadline', e.target.value)} className="input-field" placeholder="Join the #1 sports & gaming community" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                <input type="text" value={content.cta_text || ''} onChange={(e) => handleChange('cta_text', e.target.value)} className="input-field" placeholder="Join Free on WhatsApp" />
              </div>
            </div>
          </div>

          {/* Game Cards */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Game Cards</h2>
              <button type="button" onClick={addCard} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Add Card</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">These cards appear on the landing page. Upload a banner image or use icon + text. Each card links to WhatsApp.</p>

            <div className="space-y-4">
              {cards.map((card, i) => (
                <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Card {i + 1}</span>
                    {cards.length > 1 && (
                      <button type="button" onClick={() => removeCard(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input type="text" value={card.label} onChange={(e) => updateCard(i, 'label', e.target.value)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                      <input type="text" value={card.sub} onChange={(e) => updateCard(i, 'sub', e.target.value)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
                      <input type="text" value={card.icon} onChange={(e) => updateCard(i, 'icon', e.target.value)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Badge Text</label>
                      <input type="text" value={card.badge} onChange={(e) => updateCard(i, 'badge', e.target.value)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Badge Color</label>
                      <input type="color" value={card.badgeColor} onChange={(e) => updateCard(i, 'badgeColor', e.target.value)} className="h-10 w-full rounded-lg cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Odds</label>
                      <input type="text" value={card.odds} onChange={(e) => updateCard(i, 'odds', e.target.value)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                      <input type="number" value={card.order} onChange={(e) => updateCard(i, 'order', parseInt(e.target.value) || 0)} className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Banner Image</label>
                      <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                        {cardUploading === i ? 'Uploading...' : 'Upload Banner'}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleCardImageUpload(i, e)} disabled={cardUploading === i} />
                      </label>
                    </div>
                  </div>
                  {card.image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={card.image} alt="Card banner" className="h-12 rounded-lg object-cover" />
                      <button type="button" onClick={() => updateCard(i, 'image', '')} className="text-xs text-red-500 hover:underline">Remove image</button>
                    </div>
                  )}
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Gradient (fallback when no image)</label>
                    <input type="text" value={card.gradient} onChange={(e) => updateCard(i, 'gradient', e.target.value)} className="input-field text-sm py-2" placeholder="linear-gradient(135deg, #000 0%, #333 100%)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp & Misc */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp & Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default WhatsApp Number</label>
                <input type="text" value={content.default_whatsapp || ''} onChange={(e) => handleChange('default_whatsapp', e.target.value)} className="input-field" placeholder="919876543210" />
                <p className="text-xs text-gray-400 mt-1">Used when no referral code is present</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Pre-filled Message</label>
                <input type="text" value={content.whatsapp_message || ''} onChange={(e) => handleChange('whatsapp_message', e.target.value)} className="input-field" placeholder="Hi, I want to join" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={content.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} className="input-field" placeholder="support@billy777.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer</label>
                <textarea value={content.disclaimer || ''} onChange={(e) => handleChange('disclaimer', e.target.value)} className="input-field" rows={3} />
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 mb-8">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}