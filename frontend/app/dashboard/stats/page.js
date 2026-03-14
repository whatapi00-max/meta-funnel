'use client';

import { useState, useEffect } from 'react';
import StatsCard from '../../../components/StatsCard';
import ClickChart from '../../../components/ClickChart';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { marketerApi } from '../../../lib/api';

export default function MarketerStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await marketerApi.getStats();
        setStats(data);
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
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Click Statistics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard title="Today's Clicks" value={stats.todayClicks} icon="📈" />
        <StatsCard title="Total Clicks" value={stats.totalClicks} icon="🖱️" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clicks (Last 7 Days)</h2>
        <ClickChart data={stats.chartData} />
      </div>
    </div>
  );
}
