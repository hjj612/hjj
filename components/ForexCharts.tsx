"use client";

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForexData {
  currency: string;
  rate: number;
  timestamp: string;
}

interface CurrencyChartProps {
  currency: string;
  color: string;
  data: ForexData[];
}

// 샘플 데이터 생성 함수
function generateSampleData(currency: string): ForexData[] {
  const baseRates: {[key: string]: number} = {
    'USD': 1368.00, // 틱커 테이프와 동일한 가격
    'JPY': 9.12,
    'CNY': 186.45,
    'EUR': 1450.80
  };

  const data: ForexData[] = [];
  const now = new Date();
  const baseRate = baseRates[currency] || 1000;

  // 과거에서 현재 순으로 데이터 생성 (시간 순서대로)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 6 * 60 * 60 * 1000); // 6시간 간격
    const variation = (Math.random() - 0.5) * 0.05; // ±2.5% 변동
    const rate = baseRate * (1 + variation);
    
    data.push({
      currency,
      rate: parseFloat(rate.toFixed(2)),
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
}

function CurrencyChart({ currency, color, data }: CurrencyChartProps) {
  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })),
    datasets: [
      {
        label: `${currency}/KRW`,
        data: data.map(d => d.rate),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const date = new Date(data[context[0].dataIndex].timestamp);
            return date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: function(context: any) {
            return `환율: ₩${context.parsed.y.toLocaleString()}`;
          },
          afterLabel: function(context: any) {
            const currentIndex = context.dataIndex;
            if (currentIndex > 0) {
              const current = context.parsed.y;
              const previous = data[currentIndex - 1].rate;
              const change = current - previous;
              const changePercent = ((change / previous) * 100).toFixed(2);
              return `변동: ${change >= 0 ? '+' : ''}${change.toFixed(2)}원 (${changePercent}%)`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#6b7280',
          font: {
            size: 11,
            weight: 500
          }
        },
        border: {
          color: '#e5e7eb'
        }
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: 500
          },
          callback: function(value: any) {
            return `₩${value.toLocaleString()}`;
          },
          padding: 10
        },
        border: {
          display: false
        }
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      },
      line: {
        tension: 0.4,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const currentRate = data.length > 0 ? data[data.length - 1].rate : 0;
  const previousRate = data.length > 1 ? data[data.length - 2].rate : currentRate;
  const change = currentRate - previousRate;
  const changePercent = previousRate !== 0 ? (change / previousRate) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{currency}/KRW</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold" style={{ color }}>
              ₩{currentRate.toLocaleString()}
            </span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              change >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">최근 업데이트</div>
          <div className="text-sm font-medium">
            {data.length > 0 ? new Date(data[data.length - 1].timestamp).toLocaleString('ko-KR') : '-'}
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default function ForexCharts() {
  const [forexData, setForexData] = useState<{[key: string]: ForexData[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const currencies = [
    { code: 'USD', color: '#3B82F6', name: '미국 달러' },
    { code: 'JPY', color: '#EF4444', name: '일본 엔' },
    { code: 'CNY', color: '#10B981', name: '중국 위안' },
    { code: 'EUR', color: '#8B5CF6', name: '유럽 유로' }
  ];

  useEffect(() => {
    const fetchAllForexData = async () => {
      try {
        setLoading(true);
        const dataPromises = currencies.map(async (currency) => {
          const response = await fetch(`/api/forex-rates?currency=${currency.code}&limit=20`);
          if (!response.ok) throw new Error(`Failed to fetch ${currency.code} data`);
          const data = await response.json();
          return { currency: currency.code, data: data.data || [] };
        });

        const results = await Promise.all(dataPromises);
        const newForexData: {[key: string]: ForexData[]} = {};
        let hasRealData = false;
        
        results.forEach(result => {
          if (result.data.length > 0) {
            // 시간 순서대로 정렬 (과거 -> 현재)
            const sortedData = result.data.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            newForexData[result.currency] = sortedData;
            hasRealData = true;
          } else {
            // 실제 데이터가 없으면 샘플 데이터 생성
            newForexData[result.currency] = generateSampleData(result.currency);
          }
        });
        
        setUsingSampleData(!hasRealData);
        setForexData(newForexData);
      } catch (err) {
        console.warn('실제 데이터 로딩 실패, 샘플 데이터 사용:', err);
        // 오류 발생 시 샘플 데이터 사용
        const sampleData: {[key: string]: ForexData[]} = {};
        currencies.forEach(currency => {
          sampleData[currency.code] = generateSampleData(currency.code);
        });
        setForexData(sampleData);
        setUsingSampleData(true);
        setError(null); // 에러를 숨기고 샘플 데이터로 진행
      } finally {
        setLoading(false);
      }
    };

    fetchAllForexData();
    // 5분마다 데이터 갱신
    const interval = setInterval(fetchAllForexData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currencies.map((currency) => (
          <div key={currency.code} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">실시간 환율 차트</h2>
        <p className="text-gray-600">주요 통화별 원화 대비 환율 변동 추이</p>
        {usingSampleData && (
          <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            ⚠ 데모용 샘플 데이터를 표시하고 있습니다
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currencies.map((currency) => (
          <CurrencyChart
            key={currency.code}
            currency={currency.code}
            color={currency.color}
            data={forexData[currency.code] || []}
          />
        ))}
      </div>
    </div>
  );
} 