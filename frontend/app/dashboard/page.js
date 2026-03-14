'use client';

import { useState, useEffect } from 'react';
import StatsCard from '../../components/StatsCard';
import CopyButton from '../../components/CopyButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { marketerApi } from '../../lib/api';

export default function MarketerDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  useEffect(() => {
    async function load() {
      try {
        const [profileData, statsData] = await Promise.all([
          marketerApi.getProfile(),
          marketerApi.getStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const referralLink = `${siteUrl}/?ref=${profile?.ref_code}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {profile?.name}!</h1>
      <p className="text-gray-500 mb-6">Here&apos;s your marketer dashboard overview.</p>

      {/* Status Warning */}
      {profile?.status !== 'active' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
          Your account is currently <strong>{profile?.status}</strong>. 
          {profile?.status === 'pending' && ' Your WhatsApp number is being reviewed by the admin.'}
          {profile?.status === 'disabled' && ' Contact admin for assistance.'}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Today's Clicks" value={stats?.todayClicks || 0} icon="📈" />
        <StatsCard title="Total Clicks" value={stats?.totalClicks || 0} icon="🖱️" />
      </div>

      {/* Referral Link */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Referral Link</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono break-all border border-gray-200">
            {referralLink}
          </div>
          <CopyButton text={referralLink} label="Copy Link" />
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">WhatsApp Number</h2>
        <div className="flex items-center gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono border border-gray-200">
            +{profile?.whatsapp_number}
          </div>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
            profile?.status === 'active' ? 'bg-green-100 text-green-700' :
            profile?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {profile?.status}
          </span>
        </div>
      </div>
    </div>
  );
}
