'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { adminApi, publicApi } from '../../../lib/api';

export default function AdminSettings() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await publicApi.getContent();
        setContent(data);
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
      await adminApi.updateContent(content);
      setSuccess('Landing page content updated successfully!');
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

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const result = await adminApi.uploadHeroImage(file);
      handleChange('hero_image', result.url);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoUploadError('');
    try {
      const result = await adminApi.uploadLogoImage(file);
      handleChange('logo_image', result.url);
    } catch (err) {
      setLogoUploadError(err.message || 'Upload failed');
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
                <input type="text" value={content.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} className="input-field" placeholder="MobsForSub" />
                <p className="text-xs text-gray-400 mt-1">Shown in the header and footer of the landing page</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo (icon)</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  {logoUploading ? 'Uploading…' : 'Choose Logo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                {logoUploadError && <p className="text-xs text-red-500 mt-1">{logoUploadError}</p>}
                {content.logo_image && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={content.logo_image} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain border border-gray-200 bg-gray-50" />
                    <button type="button" onClick={() => handleChange('logo_image', '')} className="text-xs text-red-500 hover:underline">Remove logo</button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF or SVG · Max 5 MB · Recommended: square icon</p>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  {uploading ? 'Uploading…' : 'Choose Image'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleHeroUpload} disabled={uploading} />
                </label>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                {content.hero_image && (
                  <div className="mt-3">
                    <img src={content.hero_image} alt="Hero preview" className="rounded-lg h-32 w-full object-cover" />
                    <p className="text-[11px] text-gray-400 mt-1 truncate">{content.hero_image}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP or GIF · Max 5 MB</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input type="text" value={content.headline || ''} onChange={(e) => handleChange('headline', e.target.value)} className="input-field" placeholder="All Sports & Games Fan Community" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                <input type="text" value={content.cta_text || ''} onChange={(e) => handleChange('cta_text', e.target.value)} className="input-field" placeholder="Join Free on WhatsApp" />
              </div>
            </div>
          </div>

          {/* WhatsApp & Disclaimer */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp & Disclaimer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default WhatsApp Number</label>
                <input type="text" value={content.default_whatsapp || ''} onChange={(e) => handleChange('default_whatsapp', e.target.value)} className="input-field" placeholder="919876543210" />
                <p className="text-xs text-gray-400 mt-1">Used when no referral code is present</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={content.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} className="input-field" placeholder="support@mobsforsub.com" />
                <p className="text-xs text-gray-400 mt-1">Shown in the footer and legal pages</p>
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
