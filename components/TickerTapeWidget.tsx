'use client';

import { useEffect, useRef } from 'react';

// 타입 충돌 방지를 위해 global interface 선언 제거
// TradingView는 런타임에 동적으로 로드되므로 any 타입으로 처리

const TickerTapeWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // iframe contentWindow 오류를 전역적으로 캐치
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0]?.toString?.() || '';
      // TradingView iframe 관련 오류는 무시
      if (
        errorMessage.includes('contentWindow is not available') ||
        errorMessage.includes('Cannot listen to the event from the provided iframe') ||
        errorMessage.includes('tradingview') ||
        errorMessage.includes('iframe') ||
        errorMessage.includes('removeChild') ||
        errorMessage.includes('not a child of this node')
      ) {
        return; // 오류를 무시
      }
      originalConsoleError.apply(console, args);
    };

    const safeClearContainer = (container: HTMLElement) => {
      try {
        container.innerHTML = '';
      } catch (e) {
        console.log('DOM cleanup handled silently');
      }
    };

    const initWidget = () => {
      try {
        if (!containerRef.current || isInitializedRef.current) return;

        // 이미 초기화된 경우 방지
        isInitializedRef.current = true;

        // 안전한 DOM 정리
        safeClearContainer(containerRef.current);

        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container';

        // Create widget element
        const widget = document.createElement('div');
        widget.className = 'tradingview-widget-container__widget';
        widgetContainer.appendChild(widget);

        // Add container to DOM
        containerRef.current.appendChild(widgetContainer);

        // Widget configuration
        const config = {
          symbols: [
            {
              proName: "FX_IDC:USDKRW",
              title: "달러/원"
            },
            {
              proName: "FX_IDC:EURKRW",
              title: "유로/원"
            },
            {
              proName: "FX_IDC:JPYKRW",
              title: "엔/원"
            },
            {
              proName: "FX_IDC:CNYKRW",
              title: "위안/원"
            },
            {
              proName: "UPBIT:BTCKRW",
              title: "비트코인"
            },
            {
              proName: "UPBIT:ETHKRW",
              title: "이더리움"
            },
            {
              proName: "UPBIT:XRPKRW",
              title: "리플"
            }
          ],
          showSymbolLogo: true,
          colorTheme: "light",
          isTransparent: false,
          displayMode: "regular",
          locale: "ko",
          height: 46,
          largeChartUrl: "",
        };

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify(config);

        // Add script to widget container with error handling
        script.onerror = () => {
          console.log('TradingView script load failed, but continuing...');
        };

        script.onload = () => {
          console.log('TradingView ticker tape loaded successfully');
        };

        widgetContainer.appendChild(script);

      } catch (error) {
        console.log('TradingView widget initialization handled:', error);
        isInitializedRef.current = false; // 실패 시 재시도 가능하게
      }
    };

    // 짧은 지연 후 초기화 (DOM 안정화 대기)
    const timeoutId = setTimeout(initWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      isInitializedRef.current = false;
      
      // 컴포넌트 언마운트 시 console.error 복원
      console.error = originalConsoleError;
      
      if (containerRef.current) {
        safeClearContainer(containerRef.current);
      }
    };
  }, []);

  // window error 이벤트도 처리
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('contentWindow') ||
        event.message?.includes('iframe') ||
        event.message?.includes('tradingview') ||
        event.message?.includes('removeChild') ||
        event.message?.includes('not a child of this node')
      ) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString?.() || '';
      if (
        reason.includes('contentWindow') ||
        reason.includes('iframe') ||
        reason.includes('tradingview') ||
        reason.includes('removeChild')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full"
      style={{
        height: '46px'
      }}
    />
  );
};

export default TickerTapeWidget; 