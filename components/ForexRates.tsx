"use client";

import { useEffect, useState } from 'react';

interface ForexRate {
  currency: string;
  rate: number;
  timestamp: string;
}

export default function ForexRates() {
  const [rates, setRates] = useState<ForexRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/fetch-real-forex');
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();
        setRates(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // 5분마다 갱신
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>환율 데이터 로딩중...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">실시간 환율</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rates.map((rate) => (
          <div key={rate.currency} className="bg-gray-50 rounded p-4">
            <div className="text-lg font-medium">{rate.currency}/KRW</div>
            <div className="text-3xl font-bold">{rate.rate.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              {new Date(rate.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 