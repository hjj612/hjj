'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const ForexHeatmap = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="tradingview-widget-container h-full">
        <div className="tradingview-widget-container__widget h-full"></div>
      </div>
      <Script id="tradingview-heatmap-widget" strategy="afterInteractive">
        {`
          new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "currencies": [
              {
                "name": "원화",
                "symbol": "KRW",
                "flag": "KR"
              },
              {
                "name": "미국 달러",
                "symbol": "USD",
                "flag": "US"
              },
              {
                "name": "중국 위안",
                "symbol": "CNY",
                "flag": "CN"
              },
              {
                "name": "일본 엔",
                "symbol": "JPY",
                "flag": "JP"
              },
              {
                "name": "유로",
                "symbol": "EUR",
                "flag": "EU"
              }
            ],
            "showSymbolLogo": true,
            "colorTheme": "light",
            "isTransparent": false,
            "locale": "kr",
            "container_id": "tradingview-widget-container__widget",
            "type": "forex-cross-rates"
          });
        `}
      </Script>
      <Script
        src="https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js"
        strategy="beforeInteractive"
      />
    </>
  );
};

export default ForexHeatmap; 