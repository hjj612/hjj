'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    TradingView: {
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
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
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
      }
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