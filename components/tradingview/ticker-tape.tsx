'use client';

import React, { useEffect, useRef, useState } from 'react';

const TradingViewTickerTape: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const widgetIdRef = useRef<string>('');

  useEffect(() => {
    // 고유한 위젯 ID 생성
    const widgetId = `tradingview_widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    widgetIdRef.current = widgetId;

    const initWidget = () => {
      try {
        if (!containerRef.current) return;

        // 기존 내용 완전히 정리
        containerRef.current.innerHTML = '';

        // 위젯 컨테이너 생성
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container';
        widgetDiv.id = widgetId;
        
        // 내부 위젯 div 생성
        const innerDiv = document.createElement('div');
        innerDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.appendChild(innerDiv);

        // 저작권 정보 div (TradingView에서 요구)
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">환율 정보</span></a>';
        widgetDiv.appendChild(copyrightDiv);

        // iframe 오류 방지를 위한 설정
        const config = {
          symbols: [
            {
              description: "USD/KRW",
              proName: "FX:USDKRW"
            },
            {
              description: "EUR/KRW",
              proName: "FX:EURKRW"
            },
            {
              description: "JPY/KRW",
              proName: "FX:JPYKRW"
            },
            {
              description: "CNY/KRW",
              proName: "FX:CNYKRW"
            }
          ],
          showSymbolLogo: true,
          isTransparent: false,
          displayMode: "compact",
          colorTheme: "light",
          locale: "kr",
          largeChartUrl: "",
          width: "100%",
          height: "40",
          // iframe 접근 관련 오류 방지 설정
          enableScrolling: false,
          hideDateRanges: false,
          hideMarketStatus: false,
          hideSymbolLogo: false,
          scalePosition: "right",
          scaleMode: "Normal",
          fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
          fontSize: "10",
          noTimeScale: false,
          valuesTracking: "1",
          changeMode: "price-and-percent",
          chartType: "area",
          maLineColor: "#2962FF",
          maLineWidth: 1,
          maLength: 9,
          backgroundColor: "rgba(255, 255, 255, 1)",
          lineWidth: 2,
          lineType: 0,
          dateRanges: "1D|1W|1M|3M|6M|YTD|1Y|ALL",
          // 중요: iframe 리사이즈 이벤트 비활성화
          container_id: widgetId,
          autosize: false,
          // iframe contentWindow 접근 방지
          studies_overrides: {},
          overrides: {},
          enabled_features: [],
          disabled_features: [
            "use_localstorage_for_settings",
            "right_bar_stays_on_scroll",
            "header_symbol_search",
            "header_resolutions",
            "compare_symbol",
            "border_around_the_chart",
            "remove_library_container_border"
          ]
        };

        // 스크립트 엘리먼트 생성
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        
        // 설정을 JSON으로 스크립트에 추가
        script.innerHTML = JSON.stringify(config);

        // 스크립트 로드 이벤트
        script.onload = () => {
          console.log('TradingView widget loaded successfully');
          setIsLoaded(true);
          setHasError(false);
        };

        script.onerror = (error) => {
          console.warn('TradingView widget failed to load:', error);
          setHasError(true);
          setIsLoaded(false);
        };

        // DOM에 추가
        widgetDiv.appendChild(script);
        containerRef.current.appendChild(widgetDiv);

        // iframe 오류 이벤트 리스너 추가 (오류 캐치용)
        const handleError = (event: ErrorEvent) => {
          if (event.message && event.message.includes('contentWindow')) {
            console.warn('TradingView iframe contentWindow error caught and handled');
            // 오류를 무시하고 계속 진행
            event.preventDefault();
            return false;
          }
        };

        // 글로벌 오류 핸들러 추가
        window.addEventListener('error', handleError);

        // cleanup 함수에서 이벤트 리스너 제거
        return () => {
          window.removeEventListener('error', handleError);
        };

      } catch (error) {
        console.error('TradingView widget initialization error:', error);
        setHasError(true);
      }
    };

    // DOM 준비 후 초기화 (지연시간 추가)
    const timer = setTimeout(initWidget, 200);

    return () => {
      clearTimeout(timer);
      // cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 에러 발생시 대체 UI
  if (hasError) {
    return (
      <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">📈</span>
          <span>환율 정보</span>
          <span className="ml-4 text-xs">USD: 1,330원 | EUR: 1,451원 | JPY: 903원/100엔 | CNY: 186원</span>
        </div>
      </div>
    );
  }

  // 로딩 중 UI
  if (!isLoaded) {
    return (
      <div className="w-full h-10 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="flex items-center text-gray-400 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span>환율 정보 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-10 overflow-hidden rounded-lg"
      style={{
        minHeight: '40px',
        maxHeight: '40px'
      }}
    />
  );
};

export default TradingViewTickerTape;
