'use client';

import { useEffect } from 'react';

// 타입 충돌을 피하기 위해 더 구체적인 타입 선언
declare global {
  interface Window {
    TradingViewWidget?: {
      widget: new (config: any) => any;
    };
  }
}

const TradingViewWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      // 안전한 타입 체크
      if (typeof (window as any).TradingView !== 'undefined') {
        try {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: "NASDAQ:AAPL",
            interval: "D",
            timezone: "Asia/Seoul",
            theme: "light",
            style: "1",
            locale: "kr",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_chart"
          });
        } catch (error) {
          console.warn('TradingView widget failed to load:', error);
        }
      }
    };
    script.onerror = () => {
      console.warn('Failed to load TradingView script');
    };
    document.head.appendChild(script);

    return () => {
      const container = document.getElementById('tradingview_chart');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview_chart" style={{ height: '600px' }} />
    </div>
  );
};

export default TradingViewWidget; 