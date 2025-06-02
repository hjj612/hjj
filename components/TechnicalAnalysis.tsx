"use client";

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ko } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface HistoricalData {
  currency: string;
  rate: number;
  timestamp: string;
}

interface TechnicalIndicators {
  upperBand: number[];
  middleBand: number[];
  lowerBand: number[];
  sma20: number[];
  sma50: number[];
}

export default function TechnicalAnalysis({ currency }: { currency: string }) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    upperBand: [],
    middleBand: [],
    lowerBand: [],
    sma20: [],
    sma50: [],
  });

  // 볼린저 밴드 계산 함수
  const calculateBollingerBands = (data: number[], period: number = 20) => {
    const sma = calculateSMA(data, period);
    const stdDev = data.map((_, idx) => {
      if (idx < period - 1) return null;
      const slice = data.slice(idx - period + 1, idx + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const squaredDiffs = slice.map(x => Math.pow(x - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      return Math.sqrt(variance);
    });

    return {
      upper: data.map((_, idx) => 
        idx < period - 1 ? null : sma[idx] + (stdDev[idx] || 0) * 2
      ),
      middle: sma,
      lower: data.map((_, idx) =>
        idx < period - 1 ? null : sma[idx] - (stdDev[idx] || 0) * 2
      ),
    };
  };

  // 이동평균 계산 함수
  const calculateSMA = (data: number[], period: number) => {
    return data.map((_, idx) => {
      if (idx < period - 1) return null;
      const slice = data.slice(idx - period + 1, idx + 1);
      return slice.reduce((a, b) => a + b, 0) / period;
    });
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`/api/fetch-historical-forex?currency=${currency}`);
        if (!response.ok) throw new Error('Failed to fetch historical data');
        const data = await response.json();
        const sortedData = data.sort((a: HistoricalData, b: HistoricalData) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setHistoricalData(sortedData);

        // 기술적 지표 계산
        const rates = sortedData.map(d => d.rate);
        const bollingerBands = calculateBollingerBands(rates);
        const sma20 = calculateSMA(rates, 20);
        const sma50 = calculateSMA(rates, 50);

        setIndicators({
          upperBand: bollingerBands.upper.filter(x => x !== null) as number[],
          middleBand: bollingerBands.middle.filter(x => x !== null) as number[],
          lowerBand: bollingerBands.lower.filter(x => x !== null) as number[],
          sma20: sma20.filter(x => x !== null) as number[],
          sma50: sma50.filter(x => x !== null) as number[],
        });
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [currency]);

  const chartData = {
    labels: historicalData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: '환율',
        data: historicalData.map(d => d.rate),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: '상단 밴드',
        data: indicators.upperBand,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: '중간 밴드 (20일 이동평균)',
        data: indicators.middleBand,
        borderColor: 'rgba(54, 162, 235, 0.5)',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: '하단 밴드',
        data: indicators.lowerBand,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: '50일 이동평균',
        data: indicators.sma50,
        borderColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${currency}/KRW 기술적 분석`,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          tooltipFormat: 'yyyy-MM-dd',
          displayFormats: {
            day: 'MM/dd',
          },
        },
        adapters: {
          date: {
            locale: ko,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: '환율',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Line data={chartData} options={options} />
    </div>
  );
} 