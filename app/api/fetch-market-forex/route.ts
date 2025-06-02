import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';

  try {
    console.log(`🔄 ${currency} 마켓 실시간 환율 가져오기 시작...`);
    
    // 1차: CurrencyLayer API (실시간성이 높음)
    try {
      const currencyLayerUrl = `http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_API_KEY}&currencies=KRW&source=${currency}&format=1`;
      console.log('📡 CurrencyLayer API 호출 중...');
      
      const response = await fetch(currencyLayerUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.quotes && data.quotes[`${currency}KRW`]) {
          const currentRate = parseFloat(data.quotes[`${currency}KRW`].toFixed(2));
          const lastRefreshed = new Date(data.timestamp * 1000).toISOString();
          
          console.log(`✅ CurrencyLayer ${currency}/KRW 환율: ${currentRate}원`);
          console.log(`⏰ 실제 업데이트 시간: ${lastRefreshed}`);

          await saveForexData({
            currency: currency,
            rate: currentRate,
            timestamp: lastRefreshed
          });

          const storedData = await getForexData(currency, 5);

          return NextResponse.json({
            success: true,
            message: `${currency} 마켓 실시간 환율 업데이트 완료`,
            api_source: 'CurrencyLayer (Real-time)',
            current_rate: currentRate,
            last_refreshed: lastRefreshed,
            stored_data_count: storedData.length,
            recent_rates: storedData.slice(0, 3).map(d => ({
              rate: d.rate,
              timestamp: d.timestamp
            }))
          });
        }
      }
    } catch (error) {
      console.log('⚠️ CurrencyLayer API 실패:', error);
    }

    // 2차: Fixer API (높은 정확도)
    try {
      const fixerUrl = `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}&base=${currency}&symbols=KRW`;
      console.log('📡 Fixer API 호출 중...');
      
      const response = await fetch(fixerUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.rates && data.rates.KRW) {
          const currentRate = parseFloat(data.rates.KRW.toFixed(2));
          const lastRefreshed = new Date(data.timestamp * 1000).toISOString();
          
          console.log(`✅ Fixer ${currency}/KRW 환율: ${currentRate}원`);
          console.log(`⏰ 실제 업데이트 시간: ${lastRefreshed}`);

          await saveForexData({
            currency: currency,
            rate: currentRate,
            timestamp: lastRefreshed
          });

          const storedData = await getForexData(currency, 5);

          return NextResponse.json({
            success: true,
            message: `${currency} 마켓 실시간 환율 업데이트 완료`,
            api_source: 'Fixer (High Accuracy)',
            current_rate: currentRate,
            last_refreshed: lastRefreshed,
            stored_data_count: storedData.length,
            recent_rates: storedData.slice(0, 3).map(d => ({
              rate: d.rate,
              timestamp: d.timestamp
            }))
          });
        }
      }
    } catch (error) {
      console.log('⚠️ Fixer API 실패:', error);
    }

    // 3차: Alpha Vantage API (시장 데이터 - 크로스 환율 지원)
    try {
      console.log('📡 Alpha Vantage API 호출 중...');
      
      if (currency === 'EUR') {
        // EUR의 경우 크로스 환율 계산 (EUR/USD * USD/KRW)
        console.log('💱 EUR 크로스 환율 계산 중...');
        
        // EUR/USD 환율 가져오기
        const eurUsdUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        const eurUsdResponse = await fetch(eurUsdUrl);
        
        if (eurUsdResponse.ok) {
          const eurUsdData = await eurUsdResponse.json();
          const eurUsdExchange = eurUsdData['Realtime Currency Exchange Rate'];
          
          if (eurUsdExchange) {
            const eurUsdRate = parseFloat(eurUsdExchange['5. Exchange Rate']);
            console.log(`📊 EUR/USD 환율: ${eurUsdRate}`);
            
            // USD/KRW 환율 가져오기
            await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 간격
            
            const usdKrwUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
            const usdKrwResponse = await fetch(usdKrwUrl);
            
            if (usdKrwResponse.ok) {
              const usdKrwData = await usdKrwResponse.json();
              const usdKrwExchange = usdKrwData['Realtime Currency Exchange Rate'];
              
              if (usdKrwExchange) {
                const usdKrwRate = parseFloat(usdKrwExchange['5. Exchange Rate']);
                console.log(`📊 USD/KRW 환율: ${usdKrwRate}`);
                
                // EUR/KRW = EUR/USD * USD/KRW
                const currentRate = parseFloat((eurUsdRate * usdKrwRate).toFixed(2));
                const lastRefreshed = new Date(usdKrwExchange['6. Last Refreshed']).toISOString();
                
                console.log(`✅ Alpha Vantage EUR/KRW 크로스 환율: ${currentRate}원`);
                console.log(`⏰ 실제 업데이트 시간: ${lastRefreshed}`);
                console.log(`🧮 계산 공식: ${eurUsdRate} × ${usdKrwRate} = ${currentRate}`);

                await saveForexData({
                  currency: currency,
                  rate: currentRate,
                  timestamp: lastRefreshed
                });

                const storedData = await getForexData(currency, 5);

                return NextResponse.json({
                  success: true,
                  message: `${currency} 마켓 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Cross Rate)',
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed,
                  stored_data_count: storedData.length,
                  recent_rates: storedData.slice(0, 3).map(d => ({
                    rate: d.rate,
                    timestamp: d.timestamp
                  })),
                  cross_rate_calculation: {
                    eur_usd: eurUsdRate,
                    usd_krw: usdKrwRate,
                    formula: `${eurUsdRate} × ${usdKrwRate} = ${currentRate}`
                  }
                });
              }
            }
          }
        }
      } else if (currency === 'CNY') {
        // CNY의 경우 크로스 환율 계산 (CNY/USD * USD/KRW)
        console.log('💱 CNY 크로스 환율 계산 중...');
        
        // CNY/USD 환율 가져오기  
        const cnyUsdUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=CNY&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        const cnyUsdResponse = await fetch(cnyUsdUrl);
        
        if (cnyUsdResponse.ok) {
          const cnyUsdData = await cnyUsdResponse.json();
          const cnyUsdExchange = cnyUsdData['Realtime Currency Exchange Rate'];
          
          if (cnyUsdExchange) {
            const cnyUsdRate = parseFloat(cnyUsdExchange['5. Exchange Rate']);
            console.log(`📊 CNY/USD 환율: ${cnyUsdRate}`);
            
            // USD/KRW 환율 가져오기
            await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 간격
            
            const usdKrwUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
            const usdKrwResponse = await fetch(usdKrwUrl);
            
            if (usdKrwResponse.ok) {
              const usdKrwData = await usdKrwResponse.json();
              const usdKrwExchange = usdKrwData['Realtime Currency Exchange Rate'];
              
              if (usdKrwExchange) {
                const usdKrwRate = parseFloat(usdKrwExchange['5. Exchange Rate']);
                console.log(`📊 USD/KRW 환율: ${usdKrwRate}`);
                
                // CNY/KRW = CNY/USD * USD/KRW
                const currentRate = parseFloat((cnyUsdRate * usdKrwRate).toFixed(2));
                const lastRefreshed = new Date(usdKrwExchange['6. Last Refreshed']).toISOString();
                
                console.log(`✅ Alpha Vantage CNY/KRW 크로스 환율: ${currentRate}원`);
                console.log(`⏰ 실제 업데이트 시간: ${lastRefreshed}`);
                console.log(`🧮 계산 공식: ${cnyUsdRate} × ${usdKrwRate} = ${currentRate}`);

                await saveForexData({
                  currency: currency,
                  rate: currentRate,
                  timestamp: lastRefreshed
                });

                const storedData = await getForexData(currency, 5);

                return NextResponse.json({
                  success: true,
                  message: `${currency} 마켓 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Cross Rate)',
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed,
                  stored_data_count: storedData.length,
                  recent_rates: storedData.slice(0, 3).map(d => ({
                    rate: d.rate,
                    timestamp: d.timestamp
                  })),
                  cross_rate_calculation: {
                    cny_usd: cnyUsdRate,
                    usd_krw: usdKrwRate,
                    formula: `${cnyUsdRate} × ${usdKrwRate} = ${currentRate}`
                  }
                });
              }
            }
          }
        }
      } else {
        // USD, JPY는 직접 환율
        const alphaUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        
        const response = await fetch(alphaUrl);
        if (response.ok) {
          const data = await response.json();
          const exchangeData = data['Realtime Currency Exchange Rate'];
          
          if (exchangeData) {
            const currentRate = parseFloat(exchangeData['5. Exchange Rate']);
            const lastRefreshed = new Date(exchangeData['6. Last Refreshed']).toISOString();
            
            console.log(`✅ Alpha Vantage ${currency}/KRW 환율: ${currentRate}원`);
            console.log(`⏰ 실제 업데이트 시간: ${lastRefreshed}`);

            await saveForexData({
              currency: currency,
              rate: currentRate,
              timestamp: lastRefreshed
            });

            const storedData = await getForexData(currency, 5);

            return NextResponse.json({
              success: true,
              message: `${currency} 마켓 실시간 환율 업데이트 완료`,
              api_source: 'Alpha Vantage (Market Data)',
              current_rate: currentRate,
              last_refreshed: lastRefreshed,
              stored_data_count: storedData.length,
              recent_rates: storedData.slice(0, 3).map(d => ({
                rate: d.rate,
                timestamp: d.timestamp
              }))
            });
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Alpha Vantage API 실패:', error);
    }

    // 4차: 한국거래소 및 금융감독원 공식 환율 (가장 정확)
    try {
      // 한국은행 기준환율 API 사용
      const bokDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const bokUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${process.env.BOK_API_KEY}/json/kr/1/1/036Y001/DD/${bokDate}/${bokDate}/${currency === 'USD' ? 'USD' : currency === 'JPY' ? 'JPY' : currency === 'EUR' ? 'EUR' : 'CNY'}`;
      
      console.log('📡 한국은행 기준환율 API 호출 중...');
      
      const response = await fetch(bokUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.StatisticSearch && data.StatisticSearch.row && data.StatisticSearch.row.length > 0) {
          let currentRate = parseFloat(data.StatisticSearch.row[0].DATA_VALUE);
          
          // JPY는 100엔 기준이므로 1엔 기준으로 변환
          if (currency === 'JPY') {
            currentRate = currentRate / 100;
          }
          
          const lastRefreshed = new Date().toISOString();
          
          console.log(`✅ 한국은행 ${currency}/KRW 기준환율: ${currentRate}원`);
          console.log(`⏰ 한국은행 기준환율 시간: ${lastRefreshed}`);

          await saveForexData({
            currency: currency,
            rate: parseFloat(currentRate.toFixed(2)),
            timestamp: lastRefreshed
          });

          const storedData = await getForexData(currency, 5);

          return NextResponse.json({
            success: true,
            message: `${currency} 한국은행 기준환율 업데이트 완료`,
            api_source: 'Bank of Korea (Official Rate)',
            current_rate: parseFloat(currentRate.toFixed(2)),
            last_refreshed: lastRefreshed,
            stored_data_count: storedData.length,
            recent_rates: storedData.slice(0, 3).map(d => ({
              rate: d.rate,
              timestamp: d.timestamp
            }))
          });
        }
      }
    } catch (error) {
      console.log('⚠️ 한국은행 API 실패:', error);
    }

    // 모든 API 실패 시 폴백
    console.log('🔄 모든 마켓 API 실패, 기본 실시간 API로 폴백...');
    
    // 기존 fetch-real-forex API 호출
    const fallbackResponse = await fetch(new URL('/api/fetch-real-forex', request.url).toString() + `?currency=${currency}`);
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      
      return NextResponse.json({
        success: true,
        message: `${currency} 폴백 환율 사용 (마켓 API 모두 실패)`,
        api_source: 'Fallback to Real-time API',
        current_rate: fallbackData.current_rate,
        last_refreshed: fallbackData.last_refreshed,
        warning: '마켓 API 접근 실패로 일반 실시간 API 사용 중'
      });
    }

    throw new Error('모든 환율 소스 접근 실패');

  } catch (error) {
    console.error('❌ 마켓 환율 가져오기 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        currency: currency,
        message: '마켓 환율 데이터 조회 실패'
      },
      { status: 500 }
    );
  }
} 