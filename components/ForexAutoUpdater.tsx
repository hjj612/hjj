'use client';

import { useEffect, useState } from 'react';

interface ForexAutoUpdaterProps {
  onUpdate?: (data: any) => void;
  currencies?: string[];
  autoUpdateInterval?: number; // 분 단위
}

const ForexAutoUpdater: React.FC<ForexAutoUpdaterProps> = ({
  onUpdate,
  currencies = ['USD', 'JPY', 'EUR', 'CNY'],
  autoUpdateInterval = 30 // 30분마다 자동 업데이트
}) => {
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 환율 업데이트 함수
  const updateForexRates = async () => {
    if (isUpdating) return; // 이미 업데이트 중이면 중복 실행 방지
    
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('🔄 자동 환율 업데이트 시작...');
      
      // 모든 통화에 대해 순차적으로 업데이트
      for (const currency of currencies) {
        try {
          console.log(`📡 ${currency} 환율 업데이트 중...`);
          
          const response = await fetch(`/api/fetch-real-forex?currency=${currency}`, {
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
            console.log(`✅ ${currency} 환율 업데이트 성공: ${data.current_rate}원`);
            
            // 콜백 함수 호출 (부모 컴포넌트에 알림)
            if (onUpdate) {
              onUpdate({
                currency,
                rate: data.current_rate,
                timestamp: data.last_refreshed,
                api_source: data.api_source
              });
            }
          } else {
            console.error(`❌ ${currency} 환율 업데이트 실패:`, data.error);
            setError(`${currency} 업데이트 실패: ${data.error}`);
          }
          
          // API 호출 간격 (1초 대기)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ ${currency} 환율 업데이트 중 오류:`, error);
          setError(`${currency} 업데이트 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
      }
      
      setLastUpdate(new Date().toISOString());
      setUpdateCount(prev => prev + 1);
      console.log('🎉 모든 환율 업데이트 완료!');
      
    } catch (error) {
      console.error('❌ 자동 환율 업데이트 실패:', error);
      setError(`자동 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 컴포넌트 마운트 시 초기 업데이트
  useEffect(() => {
    console.log('🚀 ForexAutoUpdater 마운트 - 초기 환율 업데이트 시작');
    updateForexRates();
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 주기적 자동 업데이트 설정
  useEffect(() => {
    const intervalMs = autoUpdateInterval * 60 * 1000; // 분을 밀리초로 변환
    
    console.log(`⏰ 자동 업데이트 간격 설정: ${autoUpdateInterval}분 (${intervalMs}ms)`);
    
    const interval = setInterval(() => {
      console.log(`🔄 ${autoUpdateInterval}분 간격 자동 업데이트 실행`);
      updateForexRates();
    }, intervalMs);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      console.log('🧹 ForexAutoUpdater 언마운트 - 인터벌 정리');
      clearInterval(interval);
    };
  }, [autoUpdateInterval, currencies]);

  // 페이지 포커스 시 업데이트 (사용자가 탭을 다시 열 때)
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ 페이지 포커스 감지 - 환율 업데이트 실행');
      updateForexRates();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 온라인 상태 복구 시 업데이트
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 온라인 상태 복구 - 환율 업데이트 실행');
      updateForexRates();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 디버그 정보 (개발 모드에서만 표시)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg text-xs z-50 max-w-xs">
        <div className="font-semibold text-gray-800 mb-2">🔄 자동 환율 업데이트</div>
        
        <div className="space-y-1 text-gray-600">
          <div>상태: {isUpdating ? '🔄 업데이트 중' : '✅ 대기 중'}</div>
          <div>업데이트 횟수: {updateCount}회</div>
          <div>마지막 업데이트: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '없음'}</div>
          <div>간격: {autoUpdateInterval}분</div>
          <div>통화: {currencies.join(', ')}</div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ {error}
          </div>
        )}
        
        <button
          onClick={updateForexRates}
          disabled={isUpdating}
          className="mt-2 w-full px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUpdating ? '업데이트 중...' : '수동 업데이트'}
        </button>
      </div>
    );
  }

  // 프로덕션 모드에서는 보이지 않음
  return null;
};

export default ForexAutoUpdater; 