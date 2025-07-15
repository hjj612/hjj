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
        // 강제 업데이트로 실시간 환율 가져오기
        const response = await fetch('/api/fetch-real-forex?force=true');
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();
        
        // 데이터 구조 확인 및 처리
        if (data.success && data.current_rate) {
          // 단일 통화 응답인 경우
          setRates([{
            currency: 'USD', // 기본값
            rate: data.current_rate,
            timestamp: data.last_refreshed
          }]);
        } else if (data.data && Array.isArray(data.data)) {
          // 배열 응답인 경우
          setRates(data.data);
        } else {
          console.warn('예상하지 못한 데이터 형식:', data);
          setRates([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // 2분마다 실시간 갱신 (기존 5분에서 단축)
    const interval = setInterval(fetchRates, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>환율 데이터 로딩중...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        실시간 환율
        <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
          ⚡ 실시간
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rates.map((rate) => (
          <div key={rate.currency} className="bg-gray-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-lg font-medium">{rate.currency}/KRW</div>
            <div className="text-3xl font-bold text-green-600">{rate.rate.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              {new Date(rate.timestamp).toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1">
              ⚡ 실시간 업데이트
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 