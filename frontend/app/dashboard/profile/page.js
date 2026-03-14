'use client';

import { useState, useEffect } from 'react';
import CopyButton from '../../../components/CopyButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { marketerApi } from '../../../lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function MarketerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  useEffect(() => {
    async function load() {
      try {
        const data = await marketerApi.getProfile();
        setProfile(data);
        setNewNumber(data.whatsapp_number);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleUpdateNumber(e) {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');

    try {
      const data = await marketerApi.updateWhatsApp(newNumber);
      setProfile(data.marketer);
      setUpdateMsg('WhatsApp number updated! Status set to pending for admin review.');
      setTimeout(() => setUpdateMsg(''), 5000);
    } catch (err) {
      setUpdateMsg(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  const referralLink = `${siteUrl}/?ref=${profile?.ref_code}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Profile Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-sm font-medium text-gray-500 sm:w-32">Name:</span>
            <span className="text-gray-900">{profile?.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-sm font-medium text-gray-500 sm:w-32">Ref Code:</span>
            <span className="text-gray-900 font-mono">{profile?.ref_code}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-sm font-medium text-gray-500 sm:w-32">Status:</span>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              profile?.status === 'active' ? 'bg-green-100 text-green-700' :
              profile?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {profile?.status}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-sm font-medium text-gray-500 sm:w-32">Joined:</span>
            <span className="text-gray-900">
              {new Date(profile?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link + QR */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral Link</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono break-all border border-gray-200">
            {referralLink}
          </div>
          <CopyButton text={referralLink} label="Copy Link" />
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-3">QR Code for your referral link:</p>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <QRCodeSVG value={referralLink} size={180} level="M" />
          </div>
        </div>
      </div>

      {/* Update WhatsApp */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update WhatsApp Number</h2>

        {updateMsg && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${
            updateMsg.includes('updated') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {updateMsg}
          </div>
        )}

        <form onSubmit={handleUpdateNumber} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="input-field sm:max-w-xs"
            placeholder="919876543210"
            pattern="^\d{10,15}$"
            title="10-15 digits including country code"
            required
          />
          <button type="submit" disabled={updating} className="btn-primary whitespace-nowrap">
            {updating ? 'Updating...' : 'Update Number'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          After updating, your number will be set to &quot;pending&quot; until admin approves it.
        </p>
      </div>
    </div>
  );
}
