import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, addDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CurrencyPrediction {
  date: string;
  value: number;
  confidence: number;
}

interface PredictionData {
  currency: string;
  predictions: CurrencyPrediction[];
  confidence: number;
}

const currencies = ['USD', 'JPY', 'CNY', 'EUR'];

export default function ForexPredictionBot() {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    fetchPredictions();
  }, [selectedCurrency]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 대신 임시 데이터 생성
      const mockPrediction = generateMockPrediction(selectedCurrency);
      setPredictions([mockPrediction]);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    }
    setLoading(false);
  };

  const generateMockPrediction = (currency: string): PredictionData => {
    const predictions: CurrencyPrediction[] = [];
    const baseValue = currency === 'JPY' ? 100 : currency === 'EUR' ? 0.8 : 1300;
    
    for (let i = 0; i < 7; i++) {
      predictions.push({
        date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
        value: baseValue + (Math.random() - 0.5) * 20,
        confidence: 85 + (Math.random() * 10)
      });
    }

    return {
      currency,
      predictions,
      confidence: 90
    };
  };

  const getChartData = (predictionData: PredictionData) => {
    return {
      labels: predictionData.predictions.map(p => p.date),
      datasets: [
        {
          label: `${predictionData.currency}/KRW 예측`,
          data: predictionData.predictions.map(p => p.value),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '주간 환율 예측'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">환율 예측 봇</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          통화 선택
        </label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="block w-full p-2 border rounded-md"
        >
          {currencies.map(currency => (
            <option key={currency} value={currency}>
              {currency}/KRW
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : predictions.map((prediction, index) => (
        <div key={index} className="mb-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">
              {prediction.currency}/KRW 예측 결과
            </h3>
            <p className="text-gray-600">
              신뢰도: {prediction.confidence.toFixed(2)}%
            </p>
          </div>
          
          <div className="h-[400px]">
            <Line
              data={getChartData(prediction)}
              options={chartOptions}
            />
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">일일 예측값</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {prediction.predictions.map((pred, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{pred.date}</p>
                  <p className="text-lg">{pred.value.toFixed(2)} KRW</p>
                  <p className="text-sm text-gray-500">
                    신뢰도: {pred.confidence.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 