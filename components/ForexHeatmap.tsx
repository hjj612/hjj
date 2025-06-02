'use client';

import React, { useEffect, useState } from 'react';

// TradingView 타입 선언 제거 (필요시 별도 파일에서 관리)

const ForexHeatmap: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 시간 업데이트 함수
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mounted) {
      // 위젯 로딩 시뮬레이션
      const timer = setTimeout(() => {
        setWidgetLoaded(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center w-full h-full bg-white rounded-lg shadow-lg border-3 border-blue-400 p-3">
        <div className="w-full mb-2">
          <h2 className="text-lg font-semibold text-gray-800">실시간 환율표</h2>
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              <span>초기화 중...</span>
            </div>
          </div>
        </div>
        <div className="w-full h-[340px] rounded-lg overflow-hidden border-2 border-blue-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full bg-white rounded-lg shadow-lg border-3 border-blue-400 p-3">
      <div className="w-full mb-2">
        <h2 className="text-lg font-semibold text-gray-800">실시간 환율표</h2>
        <div className="flex items-center text-sm text-gray-500">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              widgetLoaded ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
            }`}></div>
            <span>{widgetLoaded ? '실시간 업데이트' : '로딩 중'}</span>
          </div>
          <span className="mx-2">•</span>
          <span>{currentTime}</span>
        </div>
      </div>
      
      <div 
        className="w-full h-[340px] rounded-lg overflow-hidden border-2 border-blue-200 bg-white relative"
        style={{ minWidth: "520px", maxWidth: "580px" }}
      >
        {!widgetLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">TradingView 위젯 로딩 중...</p>
            </div>
          </div>
        ) : null}
        
        {/* TradingView 위젯을 iframe으로 임베드 */}
        <iframe
          src="https://s.tradingview.com/embed-widget/forex-cross-rates/?locale=kr#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22currencies%22%3A%5B%22KRW%22%2C%22USD%22%2C%22JPY%22%2C%22CNY%22%2C%22EUR%22%5D%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22light%22%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22forex-cross-rates%22%7D"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0
          }}
          title="TradingView Forex Cross Rates"
          scrolling="no"
          onLoad={() => setWidgetLoaded(true)}
        />
      </div>
    </div>
  );
};

export default ForexHeatmap; 