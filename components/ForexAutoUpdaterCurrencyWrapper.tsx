'use client';

import { useEffect, useState } from 'react';

interface ForexAutoUpdaterCurrencyWrapperProps {
  currencyCode: string;
  onUpdate?: (data: any) => void;
  autoUpdateInterval?: number; // 분 단위
  enableRealTimeMode?: boolean;
}

const ForexAutoUpdaterCurrencyWrapper: React.FC<ForexAutoUpdaterCurrencyWrapperProps> = ({
  currencyCode,
  onUpdate,
  autoUpdateInterval = 3, // 5분에서 3분으로 단축
  enableRealTimeMode = true // 실시간 모드 기본 활성화
}) => {
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 환율 업데이트 함수 (항상 강제 업데이트)
  const updateForexRate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log(`🔄 ${currencyCode} 실시간 환율 업데이트 시작...`);
      
      // 실시간 모드에서는 항상 force=true
      const apiUrl = `/api/fetch-real-forex?currency=${currencyCode}&force=true`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${currencyCode} 실시간 환율 업데이트 성공: ${data.current_rate}원 (소스: ${data.api_source})`);
        
        if (onUpdate) {
          onUpdate({
            currency: currencyCode,
            rate: data.current_rate,
            timestamp: data.last_refreshed,
            api_source: data.api_source,
            realtime: true
          });
        }
      } else {
        console.error(`❌ ${currencyCode} 환율 업데이트 실패:`, data.error);
        setError(`${currencyCode} 업데이트 실패: ${data.error}`);
      }
      
    } catch (error) {
      console.error(`❌ ${currencyCode} 환율 업데이트 중 오류:`, error);
      setError(`${currencyCode} 업데이트 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsUpdating(false);
    }
    
    setLastUpdate(new Date().toISOString());
    setUpdateCount(prev => prev + 1);
  };

  // 컴포넌트 마운트 시 즉시 실시간 업데이트
  useEffect(() => {
    console.log(`🚀 ${currencyCode} 실시간 환율 업데이터 시작`);
    updateForexRate();
  }, [currencyCode]);

  // 주기적 자동 업데이트
  useEffect(() => {
    const intervalMs = autoUpdateInterval * 60 * 1000;
    
    console.log(`⏰ ${currencyCode} 자동 업데이트 간격: ${autoUpdateInterval}분`);
    
    const interval = setInterval(() => {
      console.log(`🔄 ${currencyCode} ${autoUpdateInterval}분 간격 자동 업데이트 실행`);
      updateForexRate();
    }, intervalMs);

    return () => {
      console.log(`🧹 ${currencyCode} 인터벌 정리`);
      clearInterval(interval);
    };
  }, [currencyCode, autoUpdateInterval]);

  // 페이지 포커스 시 업데이트
  useEffect(() => {
    const handleFocus = () => {
      console.log(`👁️ ${currencyCode} 페이지 포커스 - 실시간 업데이트 실행`);
      updateForexRate();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [currencyCode]);

  // 개발 모드에서만 디버그 정보 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg text-xs z-50 max-w-xs">
        <div className="font-semibold text-gray-800 mb-2">
          🔄 {currencyCode} 실시간 업데이트
          <span className="text-green-600 ml-1">⚡</span>
        </div>
        
        <div className="space-y-1 text-gray-600">
          <div>상태: {isUpdating ? '🔄 업데이트 중' : '✅ 대기 중'}</div>
          <div>업데이트 횟수: {updateCount}회</div>
          <div>마지막: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '없음'}</div>
          <div>간격: {autoUpdateInterval}분</div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ {error}
          </div>
        )}
        
        <button
          onClick={updateForexRate}
          disabled={isUpdating}
          className="mt-2 w-full px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUpdating ? '업데이트 중...' : '🚀 즉시 업데이트'}
        </button>
      </div>
    );
  }

  return null;
};

export default ForexAutoUpdaterCurrencyWrapper; 