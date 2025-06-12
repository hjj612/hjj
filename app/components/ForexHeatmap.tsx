'use client';

import React, { useEffect, useState } from 'react';

// 통화 정보 정의
const currencies = [
  { code: 'KRW', name: '원화', flag: '🇰🇷' },
  { code: 'EUR', name: '유로', flag: '🇪🇺' },
  { code: 'USD', name: '달러', flag: '🇺🇸' },
  { code: 'JPY', name: '엔화', flag: '🇯🇵' },
  { code: 'CNY', name: '위안', flag: '🇨🇳' },
];

// API 응답 타입 정의
interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  date: string;
  timestamp: number;
}

// 환율 데이터 타입
interface ExchangeRateData {
  from: string;
  to: string;
  rate: number;
  change: number;
  lastUpdated: string;
}

const ForexHeatmap: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 환율 데이터 가져오기
  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      // 각 통화쌍에 대한 환율 생성
      let allRates: ExchangeRateData[] = [];
      
      for (const baseCurrency of currencies) {
        for (const targetCurrency of currencies) {
          if (baseCurrency.code === targetCurrency.code) continue;
          
          // 임의의 환율 데이터 생성
          const baseRate = getInitialRate(baseCurrency.code, targetCurrency.code);
          const prevRate = exchangeRates.find(
            rate => {
              if (rate.from === baseCurrency.code) {
                return rate.to === targetCurrency.code;
              }
              return false;
            }
          );
          
          // 약간의 변동폭 추가 (-0.2% ~ +0.2%)
          const variation = (Math.random() - 0.5) * 0.4;
          const newRate = baseRate * (1 + variation / 100);
          
          // 변화율 계산
          const change = prevRate ? ((newRate - prevRate.rate) / prevRate.rate) * 100 : 0;
          
          allRates.push({
            from: baseCurrency.code,
            to: targetCurrency.code,
            rate: newRate,
            change,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
      setExchangeRates(allRates);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error('환율 데이터 조회 오류:', error);
      setErrorMessage('환율 데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 초기 환율 값 설정
  const getInitialRate = (from: string, to: string): number => {
    const rates: Record<string, number> = {
      'KRW/USD': 0.00075,
      'KRW/JPY': 0.11,
      'KRW/CNY': 0.0053,
      'KRW/EUR': 0.00069,
      'USD/KRW': 1330.42,
      'USD/JPY': 147.33,
      'USD/CNY': 7.14,
      'USD/EUR': 0.92,
      'JPY/KRW': 903, // 100엔당 원화값
      'JPY/USD': 0.0068,
      'JPY/CNY': 0.048,
      'JPY/EUR': 0.0062,
      'CNY/KRW': 186.33,
      'CNY/USD': 0.14,
      'CNY/JPY': 20.63,
      'CNY/EUR': 0.13,
      'EUR/KRW': 1450.53,
      'EUR/USD': 1.09,
      'EUR/JPY': 160.21,
      'EUR/CNY': 7.76,
    };
    
    return rates[`${from}/${to}`] || 1;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 시간 업데이트 함수
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    // 초기 데이터 로드
    updateTime();
    fetchExchangeRates();
    
    // 주기적 업데이트 설정
    const timeInterval = setInterval(updateTime, 1000);
    const ratesInterval = setInterval(fetchExchangeRates, 30000); // 30초마다 환율 업데이트
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(ratesInterval);
    };
  }, []);

  // 특정 통화쌍의 환율 조회
  const getRateData = (from: string, to: string): ExchangeRateData | undefined => {
    return exchangeRates.find(rate => {
      if (rate.from === from) {
        return rate.to === to;
      }
      return false;
    });
  };

  // 환율 포맷팅
  const formatRate = (rate: number) => {
    if (rate < 0.01) return rate.toFixed(5);
    if (rate < 1) return rate.toFixed(4);
    if (rate < 10) return rate.toFixed(3);
    return rate.toFixed(2);
  };

  // 변화율에 따른 스타일 결정
  const getChangeStyle = (change: number) => {
    if (change > 0.1) return 'bg-green-100 text-green-700';
    if (change < -0.1) return 'bg-red-100 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg border-4 border-blue-500 p-4" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="w-full mb-3">
        <h2 className="text-lg font-semibold text-gray-800">실시간 환율표</h2>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span>실시간 업데이트</span>
            <span className="mx-2">•</span>
            <span>{currentTime}</span>
          </div>
          {lastUpdated ? (
            <div className="text-xs text-gray-400">
              마지막 업데이트: {lastUpdated}
            </div>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded mb-4">
          {errorMessage}
          <button 
            className="ml-2 underline text-blue-500"
            onClick={fetchExchangeRates}
          >
            다시 시도
          </button>
        </div>
      ) : loading ? (exchangeRates.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : null) : (
        <div className="overflow-x-auto overflow-y-hidden bg-blue-100 p-1 rounded-lg border-2 border-blue-400">
          <table className="w-full border-collapse table-fixed text-sm" style={{ maxWidth: '600px' }}>
            <thead>
              <tr>
                <th className="w-16 h-14 bg-blue-200 border-2 border-blue-300"></th>
                {currencies.map((currency) => (
                  <th key={currency.code} className="w-16 h-14 bg-blue-200 border-2 border-blue-300 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xl">{currency.code === 'KRW' ? '🇰🇷' : 
                                           currency.code === 'EUR' ? '🇪🇺' : 
                                           currency.code === 'USD' ? '🇺🇸' : 
                                           currency.code === 'JPY' ? '🇯🇵' : 
                                           currency.code === 'CNY' ? '🇨🇳' : ''}</div>
                      <div className="font-medium text-xs">{currency.code}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currencies.map((fromCurrency) => (
                <tr key={fromCurrency.code}>
                  <td className="w-16 h-14 bg-blue-200 border-2 border-blue-300 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xl">{fromCurrency.code === 'KRW' ? '🇰🇷' : 
                                            fromCurrency.code === 'EUR' ? '🇪🇺' : 
                                            fromCurrency.code === 'USD' ? '🇺🇸' : 
                                            fromCurrency.code === 'JPY' ? '🇯🇵' : 
                                            fromCurrency.code === 'CNY' ? '🇨🇳' : ''}</div>
                      <div className="font-medium text-xs">{fromCurrency.code}</div>
                    </div>
                  </td>
                  
                  {currencies.map((toCurrency) => {
                    const isSameCurrency = fromCurrency.code === toCurrency.code;
                    const rateData = !isSameCurrency ? getRateData(fromCurrency.code, toCurrency.code) : null;
                    
                    return (
                      <td 
                        key={`${fromCurrency.code}-${toCurrency.code}`} 
                        className={`w-16 h-14 border-2 border-blue-300 text-center ${
                          isSameCurrency ? 'bg-blue-200' : rateData ? getChangeStyle(rateData.change) : ''
                        }`}
                      >
                        {isSameCurrency ? (
                          <span className="font-bold text-gray-400">-</span>
                        ) : rateData ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <span className="font-medium text-sm">{formatRate(rateData.rate)}</span>
                            <span className={`text-xs ${rateData.change > 0 ? 'text-green-700' : rateData.change < 0 ? 'text-red-700' : 'text-gray-500'}`}>
                              {rateData.change > 0 ? '+' : ''}{rateData.change.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <div className="animate-pulse w-3/4 h-5 bg-gray-200 rounded mx-auto"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ForexHeatmap; 