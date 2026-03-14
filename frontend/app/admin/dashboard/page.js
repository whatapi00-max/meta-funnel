'use client';

import { useState, useEffect } from 'react';
import StatsCard from '../../../components/StatsCard';
import ClickChart from '../../../components/ClickChart';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { adminApi } from '../../../lib/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getAnalytics();
        setAnalytics(data);
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
        Failed to load analytics: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Marketers" value={analytics.totalMarketers} icon="👥" />
        <StatsCard title="Active Marketers" value={analytics.activeMarketers} icon="✅" />
        <StatsCard title="Total Clicks" value={analytics.totalClicks} icon="🖱️" />
        <StatsCard title="Today's Clicks" value={analytics.todayClicks} icon="📈" />
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clicks (Last 7 Days)</h2>
        <ClickChart data={analytics.chartData} />
      </div>

      {/* Top Marketers */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Marketers</h2>
        {analytics.topMarketers.length === 0 ? (
          <p className="text-gray-400">No marketers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Ref Code</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topMarketers.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{m.name}</td>
                    <td className="py-3 px-4 text-gray-500">{m.ref_code}</td>
                    <td className="py-3 px-4 text-right font-semibold text-brand-600">{m.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
