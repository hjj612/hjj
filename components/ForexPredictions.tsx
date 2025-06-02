"use client";

import { useEffect, useState } from 'react';
import TechnicalAnalysis from './TechnicalAnalysis';

interface Prediction {
  currency: string;
  predicted_rate: number;
  confidence: number;
  target_date: string;
}

interface ModelInfo {
  name: string;
  description: string;
  parameters: {
    name: string;
    value: string;
    description: string;
  }[];
}

const modelInfo: ModelInfo = {
  name: "ARIMA(5,1,0)",
  description: "자기회귀통합이동평균(ARIMA) 모델은 시계열 데이터를 분석하고 예측하는 통계 모델입니다. 이 모델은 과거 데이터의 패턴을 학습하여 미래 값을 예측합니다.",
  parameters: [
    {
      name: "AR(p)",
      value: "5",
      description: "자기회귀 차수로, 과거 5일간의 데이터를 사용하여 예측에 반영합니다."
    },
    {
      name: "I(d)",
      value: "1",
      description: "차분 차수로, 시계열 데이터를 안정화하기 위해 1차 차분을 수행합니다."
    },
    {
      name: "MA(q)",
      value: "0",
      description: "이동평균 차수로, 이 모델에서는 이동평균을 사용하지 않습니다."
    }
  ]
};

export default function ForexPredictions() {
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const currencies = ['USD', 'JPY', 'CNY', 'EUR'];

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const results: Record<string, Prediction[]> = {};
        
        // 각 통화에 대한 예측 데이터 가져오기
        for (const currency of currencies) {
          const response = await fetch(`/api/predict-forex?currency=${currency}`);
          if (!response.ok) throw new Error(`Failed to fetch ${currency} predictions`);
          const data = await response.json();
          results[currency] = data.data;
        }
        
        setPredictions(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <div>예측 데이터 로딩중...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">7일 예측 결과</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            예측 모델 설명
          </button>
        </div>

        {showModal ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{modelInfo.name} 모델 설명</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 mb-4">{modelInfo.description}</p>
                <h4 className="font-semibold mb-2">모델 파라미터:</h4>
                <div className="space-y-2">
                  {modelInfo.parameters.map((param) => (
                    <div key={param.name} className="border-b pb-2">
                      <div className="font-medium">{param.name} = {param.value}</div>
                      <div className="text-gray-600">{param.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-6">
          {currencies.map((currency) => (
            <div key={currency} className="border rounded-lg p-4">
              <h3 className="text-xl font-medium mb-3">{currency}/KRW</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2">날짜</th>
                      <th className="px-4 py-2">예측 환율</th>
                      <th className="px-4 py-2">신뢰도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions[currency]?.map((pred) => (
                      <tr key={pred.target_date} className="border-t">
                        <td className="px-4 py-2">{new Date(pred.target_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{pred.predicted_rate.toFixed(2)}</td>
                        <td className="px-4 py-2">{(pred.confidence * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-3">기술적 분석</h3>
          <div className="flex gap-2">
            {currencies.map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-4 py-2 rounded ${
                  selectedCurrency === currency
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {currency}/KRW
              </button>
            ))}
          </div>
        </div>
        <TechnicalAnalysis currency={selectedCurrency} />
      </div>
    </div>
  );
} 