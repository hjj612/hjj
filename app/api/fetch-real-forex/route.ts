import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

// API 호출 간격 제한을 위한 최소한의 캐시 (1분만)
const apiCallCache = new Map();
const CACHE_DURATION = 1 * 60 * 1000; // 1분만 캐시 (API 과부하 방지용)

function isCacheValid(currency: string): boolean {
  const cacheEntry = apiCallCache.get(currency);
  if (!cacheEntry) return false;
  
  const now = Date.now();
  return (now - cacheEntry.timestamp) < CACHE_DURATION;
}

function setCache(currency: string, data: any) {
  apiCallCache.set(currency, {
    data,
    timestamp: Date.now()
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';
  const forceUpdate = searchParams.get('force') === 'true'; // 강제 업데이트 파라미터 추가

  try {
    console.log(`🔄 ${currency} 실시간 환율 가져오기 시작... (강제업데이트: ${forceUpdate})`);
    console.log('🔑 API 키 확인:', process.env.ALPHA_VANTAGE_API_KEY ? '존재함' : '없음');
    
    // 1. 강제 업데이트가 아닌 경우에만 1분 캐시 확인 (API 과부하 방지만)
    if (!forceUpdate && isCacheValid(currency)) {
      console.log('📦 1분 캐시 데이터 사용 (API 과부하 방지)...');
      const cachedData = apiCallCache.get(currency).data;
      return NextResponse.json({
        success: true,
        message: `${currency} 캐시된 환율 데이터 반환`,
        api_source: 'Cache (API Overload Protection)',
        current_rate: cachedData.current_rate,
        last_refreshed: cachedData.last_refreshed,
        cached: true,
        cache_duration_minutes: 1
      });
    }
    
    // 2. 저장된 데이터 확인 로직 완전 제거 - 항상 실시간 API 호출
    console.log('🚀 실시간 API 호출 강제 실행...');
    
    // 3. 환경 변수 체크
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      console.log('⚠️ Alpha Vantage API 키가 없습니다. 실시간 폴백 시스템 사용...');
      
      // 폴백: ExchangeRate-API 사용 (API 키 불필요, 실시간 업데이트)
      try {
        console.log('📡 ExchangeRate-API 실시간 호출 중...');
        const fallbackUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`;
        const response = await fetch(fallbackUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.rates && data.rates.KRW) {
            let currentRate = data.rates.KRW;
            
            // JPY는 100엔 기준으로 변환
            if (currency === 'JPY') {
              currentRate = currentRate * 100;
            }
            
            const lastRefreshed = new Date().toISOString();
            
            console.log(`✅ ExchangeRate-API ${currency}/KRW 실시간 환율: ${currentRate}원`);
            
            await saveForexData({
              currency: currency,
              rate: currentRate,
              timestamp: lastRefreshed
            });

            const storedData = await getForexData(currency, 5);

            const result = {
              success: true,
              message: `${currency} ExchangeRate-API 실시간 환율 업데이트 완료`,
              api_source: 'ExchangeRate-API (Real-time)',
              current_rate: currentRate,
              last_refreshed: lastRefreshed,
              stored_data_count: storedData.length,
              recent_rates: storedData.slice(0, 3).map(d => ({
                rate: d.rate,
                timestamp: d.timestamp
              })),
              note: '실시간 환율 데이터 - 캐시 없음'
            };

            setCache(currency, {
              current_rate: currentRate,
              last_refreshed: lastRefreshed
            });

            return NextResponse.json(result);
          }
        }
      } catch (fallbackError) {
        console.log('⚠️ ExchangeRate-API 실시간 호출 실패:', fallbackError);
      }
      
      // 모든 실시간 API 실패 시에만 저장된 데이터 반환
      try {
        console.log('📥 모든 실시간 API 실패 - 저장된 최신 데이터 조회...');
        const storedData = await getForexData(currency, 1);
        
        if (storedData && storedData.length > 0) {
          const latestData = storedData[0];
          console.log(`📊 저장된 최신 ${currency} 환율: ${latestData.rate}원 (${latestData.timestamp})`);
          
          return NextResponse.json({
            success: true,
            message: `${currency} 저장된 최신 환율 반환`,
            api_source: 'Stored Data (API Failure Fallback)',
            current_rate: latestData.rate,
            last_refreshed: latestData.timestamp,
            stored_data_count: 1,
            recent_rates: [{
              rate: latestData.rate,
              timestamp: latestData.timestamp
            }],
            warning: '모든 실시간 API 실패로 저장된 데이터 사용. 환경 변수를 설정해주세요.'
          });
        }
      } catch (storedError) {
        console.log('⚠️ 저장된 데이터 조회도 실패:', storedError);
      }
      
      // 모든 방법 실패
      throw new Error('모든 실시간 API와 저장된 데이터 접근이 실패했습니다.');
    }
    
    // 4. 실시간 우선: 여러 API를 순서대로 시도
    console.log('🚀 실시간 API 호출 시작...');
    
    // 4-1. ExchangeRate-API 먼저 시도 (더 자주 업데이트됨)
    try {
      console.log('📡 ExchangeRate-API 실시간 데이터 호출 중...');
      const exchangeRateUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`;
      const response = await fetch(exchangeRateUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.rates && data.rates.KRW) {
          let currentRate = data.rates.KRW;
          
          // JPY는 100엔 기준으로 변환
          if (currency === 'JPY') {
            currentRate = currentRate * 100;
          }
          
          const lastRefreshed = new Date().toISOString();
          
          console.log(`✅ ExchangeRate-API ${currency}/KRW 실시간 환율: ${currentRate}원`);
          
          await saveForexData({
            currency: currency,
            rate: currentRate,
            timestamp: lastRefreshed
          });

          const storedData = await getForexData(currency, 5);

          const result = {
            success: true,
            message: `${currency} ExchangeRate-API 실시간 환율 업데이트 완료`,
            api_source: 'ExchangeRate-API (Real-time)',
            current_rate: currentRate,
            last_refreshed: lastRefreshed,
            stored_data_count: storedData.length,
            recent_rates: storedData.slice(0, 3).map(d => ({
              rate: d.rate,
              timestamp: d.timestamp
            })),
            note: '실시간 환율 데이터 - 캐시 없음'
          };

          setCache(currency, {
            current_rate: currentRate,
            last_refreshed: lastRefreshed
          });

          return NextResponse.json(result);
        }
      }
    } catch (exchangeError) {
      console.log('⚠️ ExchangeRate-API 실패:', exchangeError);
    }

    // 4-2. Alpha Vantage API 호출 (백업)
    try {
      console.log('🚀 Alpha Vantage API 실시간 데이터 호출 중...');
      
      if (currency === 'EUR') {
        // EUR의 경우 크로스 환율 계산 (EUR/USD * USD/KRW)
        console.log('💱 EUR 크로스 환율 실시간 계산 중...');
        
        // EUR/USD 환율 가져오기
        const eurUsdUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        console.log('📡 EUR/USD 실시간 환율 요청...');
        const eurUsdResponse = await fetch(eurUsdUrl);
        
        if (eurUsdResponse.ok) {
          const eurUsdData = await eurUsdResponse.json();
          console.log('📥 EUR/USD API 응답:', eurUsdData);
          
          // API 한도 초과 체크
          if (eurUsdData['Note']) {
            console.log('⚠️ Alpha Vantage API 한도 초과:', eurUsdData['Note']);
            throw new Error(`API 호출 한도 초과: ${eurUsdData['Note']}`);
          }
          
          const eurUsdExchange = eurUsdData['Realtime Currency Exchange Rate'];
          
          if (eurUsdExchange) {
            const eurUsdRate = parseFloat(eurUsdExchange['5. Exchange Rate']);
            const eurUsdTimestamp = eurUsdExchange['6. Last Refreshed'];
            console.log(`✅ EUR/USD 실시간 환율: ${eurUsdRate} (${eurUsdTimestamp})`);
            
            // USD/KRW 환율 가져오기
            await new Promise(resolve => setTimeout(resolve, 1500)); // API 호출 간격 증가
            
            const usdKrwUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
            console.log('📡 USD/KRW 실시간 환율 요청...');
            const usdKrwResponse = await fetch(usdKrwUrl);
            
            if (usdKrwResponse.ok) {
              const usdKrwData = await usdKrwResponse.json();
              console.log('📥 USD/KRW API 응답:', usdKrwData);
              
              // API 한도 초과 체크
              if (usdKrwData['Note']) {
                console.log('⚠️ Alpha Vantage API 한도 초과:', usdKrwData['Note']);
                throw new Error(`API 호출 한도 초과: ${usdKrwData['Note']}`);
              }
              
              const usdKrwExchange = usdKrwData['Realtime Currency Exchange Rate'];
              
              if (usdKrwExchange) {
                const usdKrwRate = parseFloat(usdKrwExchange['5. Exchange Rate']);
                const usdKrwTimestamp = usdKrwExchange['6. Last Refreshed'];
                console.log(`✅ USD/KRW 실시간 환율: ${usdKrwRate} (${usdKrwTimestamp})`);
                
                // EUR/KRW = EUR/USD * USD/KRW
                const currentRate = parseFloat((eurUsdRate * usdKrwRate).toFixed(2));
                const lastRefreshed = new Date(usdKrwTimestamp).toISOString();
                
                console.log(`🎯 Alpha Vantage EUR/KRW 실시간 환율: ${currentRate}원`);
                console.log(`⏰ 실제 실시간 업데이트 시간: ${lastRefreshed}`);
                console.log(`🧮 실시간 크로스 계산: ${eurUsdRate} × ${usdKrwRate} = ${currentRate}`);

                await saveForexData({
                  currency: currency,
                  rate: currentRate,
                  timestamp: lastRefreshed
                });

                const storedData = await getForexData(currency, 5);

                const result = {
                  success: true,
                  message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Real-time)',
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
                };

                setCache(currency, {
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed
                });

                return NextResponse.json(result);
              }
            }
          }
        }
      } else if (currency === 'CNY') {
        // CNY의 경우 크로스 환율 계산 (CNY/USD * USD/KRW)
        console.log('💱 CNY 크로스 환율 실시간 계산 중...');
        
        // CNY/USD 환율 가져오기  
        const cnyUsdUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=CNY&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        console.log('📡 CNY/USD 실시간 환율 요청...');
        const cnyUsdResponse = await fetch(cnyUsdUrl);
        
        if (cnyUsdResponse.ok) {
          const cnyUsdData = await cnyUsdResponse.json();
          console.log('📥 CNY/USD API 응답:', cnyUsdData);
          
          // API 한도 초과 체크
          if (cnyUsdData['Note']) {
            console.log('⚠️ Alpha Vantage API 한도 초과:', cnyUsdData['Note']);
            throw new Error(`API 호출 한도 초과: ${cnyUsdData['Note']}`);
          }
          
          const cnyUsdExchange = cnyUsdData['Realtime Currency Exchange Rate'];
          
          if (cnyUsdExchange) {
            const cnyUsdRate = parseFloat(cnyUsdExchange['5. Exchange Rate']);
            const cnyUsdTimestamp = cnyUsdExchange['6. Last Refreshed'];
            console.log(`✅ CNY/USD 실시간 환율: ${cnyUsdRate} (${cnyUsdTimestamp})`);
            
            // USD/KRW 환율 가져오기
            await new Promise(resolve => setTimeout(resolve, 1500)); // API 호출 간격 증가
            
            const usdKrwUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
            console.log('📡 USD/KRW 실시간 환율 요청...');
            const usdKrwResponse = await fetch(usdKrwUrl);
            
            if (usdKrwResponse.ok) {
              const usdKrwData = await usdKrwResponse.json();
              console.log('📥 USD/KRW API 응답:', usdKrwData);
              
              // API 한도 초과 체크
              if (usdKrwData['Note']) {
                console.log('⚠️ Alpha Vantage API 한도 초과:', usdKrwData['Note']);
                throw new Error(`API 호출 한도 초과: ${usdKrwData['Note']}`);
              }
              
              const usdKrwExchange = usdKrwData['Realtime Currency Exchange Rate'];
              
              if (usdKrwExchange) {
                const usdKrwRate = parseFloat(usdKrwExchange['5. Exchange Rate']);
                const usdKrwTimestamp = usdKrwExchange['6. Last Refreshed'];
                console.log(`✅ USD/KRW 실시간 환율: ${usdKrwRate} (${usdKrwTimestamp})`);
                
                // CNY/KRW = CNY/USD * USD/KRW
                const currentRate = parseFloat((cnyUsdRate * usdKrwRate).toFixed(2));
                const lastRefreshed = new Date(usdKrwTimestamp).toISOString();
                
                console.log(`🎯 Alpha Vantage CNY/KRW 실시간 환율: ${currentRate}원`);
                console.log(`⏰ 실제 실시간 업데이트 시간: ${lastRefreshed}`);
                console.log(`🧮 실시간 크로스 계산: ${cnyUsdRate} × ${usdKrwRate} = ${currentRate}`);

                await saveForexData({
                  currency: currency,
                  rate: currentRate,
                  timestamp: lastRefreshed
                });

                const storedData = await getForexData(currency, 5);

                const result = {
                  success: true,
                  message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Real-time)',
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
                };

                setCache(currency, {
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed
                });

                return NextResponse.json(result);
              }
            }
          }
        }
      } else {
        // USD, JPY는 직접 환율
        const alphaUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        console.log(`📡 ${currency}/KRW 실시간 환율 요청...`);
        
        const response = await fetch(alphaUrl);
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 ${currency}/KRW API 응답:`, data);
          
          // API 한도 초과 체크
          if (data['Note']) {
            console.log('⚠️ Alpha Vantage API 한도 초과:', data['Note']);
            throw new Error(`API 호출 한도 초과: ${data['Note']}`);
          }
          
          const exchangeData = data['Realtime Currency Exchange Rate'];
          
          if (exchangeData) {
            let currentRate = parseFloat(exchangeData['5. Exchange Rate']);
            
            // JPY는 1엔 기준 데이터를 100엔 기준으로 변환하여 저장
            if (currency === 'JPY') {
              currentRate = currentRate * 100;
              console.log(`🔄 JPY 환율 변환: 1엔 기준 → 100엔 기준 (${currentRate}원/100엔)`);
            }
            
            const lastRefreshed = new Date(exchangeData['6. Last Refreshed']).toISOString();
            
            console.log(`🎯 Alpha Vantage ${currency}/KRW 실시간 환율: ${currentRate}${currency === 'JPY' ? '원/100엔' : '원'}`);
            console.log(`⏰ 실제 실시간 업데이트 시간: ${lastRefreshed}`);

            console.log(`💾 Supabase에 ${currency} 환율 데이터 저장 시도...`);
            try {
              const savedData = await saveForexData({
                currency: currency,
                rate: currentRate,
                timestamp: lastRefreshed
              });
              console.log(`✅ ${currency} 환율 데이터 저장 성공:`, savedData);
            } catch (saveError) {
              console.error(`❌ ${currency} 환율 데이터 저장 실패:`, saveError);
              throw saveError;
            }

            console.log(`📥 저장된 ${currency} 환율 데이터 조회 중...`);
            try {
              const storedData = await getForexData(currency, 5);
              console.log(`✅ 저장된 ${currency} 환율 데이터:`, storedData);

              if (!storedData || storedData.length === 0) {
                throw new Error(`저장된 ${currency} 환율 데이터를 찾을 수 없습니다.`);
              }

              const result = {
                success: true,
                message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
                api_source: 'Alpha Vantage (Real-time)',
                current_rate: currentRate,
                last_refreshed: lastRefreshed,
                stored_data_count: storedData.length,
                recent_rates: storedData.slice(0, 3).map(d => ({
                  rate: d.rate,
                  timestamp: d.timestamp
                }))
              };

              setCache(currency, {
                current_rate: currentRate,
                last_refreshed: lastRefreshed
              });

              return NextResponse.json(result);
            } catch (retrieveError) {
              console.error(`❌ ${currency} 환율 데이터 조회 실패:`, retrieveError);
              throw retrieveError;
            }
          }
        }
        
        console.log(`❌ Alpha Vantage ${currency}/KRW 직접 환율 실패`);
      }
    } catch (error) {
      console.error('❌ Alpha Vantage API 호출 실패:', error);
      
      // API 한도 초과인 경우 캐시된 데이터 반환
      if (error instanceof Error && error.message.includes('API 호출 한도 초과')) {
        console.log('🔄 API 한도 초과 - 저장된 데이터 사용...');
        try {
          const storedData = await getForexData(currency, 1);
          if (storedData && storedData.length > 0) {
            const latestData = storedData[0];
            console.log(`📊 저장된 ${currency} 환율 사용: ${latestData.rate}원`);
            
            return NextResponse.json({
              success: true,
              message: `${currency} 저장된 환율 반환 (API 한도 초과)`,
              api_source: 'Stored Data (Rate Limit)',
              current_rate: latestData.rate,
              last_refreshed: latestData.timestamp,
              warning: 'Alpha Vantage API 호출 한도 초과로 저장된 데이터 사용 중',
              suggestion: '다음날까지 대기하거나 새로운 API 키를 발급받으세요'
            });
          }
        } catch (storedError) {
          console.log('⚠️ 저장된 데이터 조회도 실패:', storedError);
        }
      }
      
      throw error;
    }

    // Alpha Vantage 실패 시에만 백업 사용 (실시간성은 떨어지지만 서비스 유지용)
    console.log('⚠️ Alpha Vantage 실시간 API 실패 - 백업 API 시도 중...');
    
    // CurrencyLayer 백업
    if (process.env.CURRENCY_LAYER_API_KEY) {
      try {
        const currencyLayerUrl = `http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_API_KEY}&currencies=KRW&source=${currency}&format=1`;
        console.log('📡 CurrencyLayer 백업 API 호출 중...');
        
        const response = await fetch(currencyLayerUrl);
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.quotes && data.quotes[`${currency}KRW`]) {
            let currentRate = data.quotes[`${currency}KRW`];
            
            // JPY는 100엔 기준으로 변환
            if (currency === 'JPY') {
              currentRate = currentRate * 100;
            }
            
            const lastRefreshed = new Date().toISOString();
            
            console.log(`✅ CurrencyLayer 백업 ${currency}/KRW 환율: ${currentRate}원`);

            await saveForexData({
              currency: currency,
              rate: currentRate,
              timestamp: lastRefreshed
            });

            const storedData = await getForexData(currency, 5);

            const result = {
              success: true,
              message: `${currency} 백업 환율 사용 (Alpha Vantage 실패)`,
              api_source: 'CurrencyLayer (Backup - Not Real-time)',
              current_rate: currentRate,
              last_refreshed: lastRefreshed,
              stored_data_count: storedData.length,
              recent_rates: storedData.slice(0, 3).map(d => ({
                rate: d.rate,
                timestamp: d.timestamp
              })),
              warning: '실시간 Alpha Vantage API 접근 실패로 백업 API 사용 중'
            };

            setCache(currency, {
              current_rate: currentRate,
              last_refreshed: lastRefreshed
            });

            return NextResponse.json(result);
          }
        }
      } catch (currencyLayerError) {
        console.log('⚠️ CurrencyLayer 백업 API도 실패:', currencyLayerError);
      }
    }

    // 한국은행 기준환율 (최후 백업)
    if (process.env.BOK_API_KEY) {
      try {
        const bokDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const bokUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${process.env.BOK_API_KEY}/json/kr/1/1/036Y001/DD/${bokDate}/${bokDate}/${currency === 'USD' ? 'USD' : currency === 'JPY' ? 'JPY' : currency === 'EUR' ? 'EUR' : 'CNY'}`;
        
        console.log('📡 한국은행 기준환율 API 최후 백업 호출 중...');
        
        const response = await fetch(bokUrl);
        if (response.ok) {
          const data = await response.json();
          
          if (data.StatisticSearch && data.StatisticSearch.row && data.StatisticSearch.row.length > 0) {
            let currentRate = parseFloat(data.StatisticSearch.row[0].DATA_VALUE);
            
            // JPY는 한국은행에서 100엔 기준으로 제공되므로 그대로 사용
            // (다른 API들과 달리 이미 100엔 기준)
            
            const lastRefreshed = new Date().toISOString();
            
            console.log(`🏛️ 한국은행 ${currency}/KRW 기준환율: ${currentRate}${currency === 'JPY' ? '원/100엔' : '원'}`);
            console.log(`⚠️ 주의: 모든 실시간 API 실패로 공식 기준환율 사용`);

            await saveForexData({
              currency: currency,
              rate: parseFloat(currentRate.toFixed(2)),
              timestamp: lastRefreshed
            });

            const storedData = await getForexData(currency, 5);

            const result = {
              success: true,
              message: `${currency} 한국은행 기준환율 사용 (모든 실시간 API 실패)`,
              api_source: 'Bank of Korea (Official Rate - Not Real-time)',
              current_rate: parseFloat(currentRate.toFixed(2)),
              last_refreshed: lastRefreshed,
              stored_data_count: storedData.length,
              recent_rates: storedData.slice(0, 3).map(d => ({
                rate: d.rate,
                timestamp: d.timestamp
              })),
              warning: '모든 실시간 API 접근 실패로 공식 기준환율 사용'
            };

            setCache(currency, {
              current_rate: parseFloat(currentRate.toFixed(2)),
              last_refreshed: lastRefreshed
            });

            return NextResponse.json(result);
          }
        }
      } catch (bokError) {
        console.log('⚠️ 한국은행 API도 실패:', bokError);
      }
    }

    // 모든 API 실패 시 에러 반환
    throw new Error('모든 환율 API 접근 실패 (Alpha Vantage 실시간 포함)');

  } catch (error) {
    console.error('❌ 환율 데이터 가져오기 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '환율 데이터 가져오기 실패',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString(),
        suggestion: 'Vercel 대시보드에서 환경 변수를 확인하고 API 키를 설정해주세요.'
      },
      { status: 500 }
    );
  }
} 