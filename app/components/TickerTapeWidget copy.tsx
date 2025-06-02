'use client';

import Script from 'next/script';

export default function TickerTapeWidget() {
  return (
    <div className="w-full overflow-hidden">
      <div className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
        <Script id="tradingview-widget" strategy="lazyOnload">
          {`
            new TradingView.widget({
              "container_id": "tradingview-widget-container__widget",
              "width": "100%",
              "height": 46,
              "locale": "kr",
              "colorTheme": "light",
              "isTransparent": false,
              "displayMode": "regular",
              "autosize": true,
              "symbols": [
                {
                  "proName": "FX_IDC:USDKRW",
                  "title": "USD/KRW"
                },
                {
                  "proName": "FX_IDC:JPYKRW",
                  "title": "JPY/KRW"
                },
                {
                  "description": "Bitcoin",
                  "proName": "BINANCE:BTCKRW",
                  "title": "BTC/KRW"
                },
                {
                  "description": "Ethereum",
                  "proName": "BINANCE:ETHKRW",
                  "title": "ETH/KRW"
                },
                {
                  "description": "Ripple",
                  "proName": "BINANCE:XRPKRW",
                  "title": "XRP/KRW"
                }
              ],
              "showSymbolLogo": true,
              "largeChartUrl": "https://www.tradingview.com/chart/",
              "showFloatingTooltip": true,
              "scalePosition": "right",
              "scaleMode": "Normal",
              "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
              "noTimeScale": false,
              "valuesTracking": "1",
              "widgetFontSize": "12"
            });
          `}
        </Script>
        <Script
          src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          strategy="lazyOnload"
        />
      </div>
    </div>
  );
} 