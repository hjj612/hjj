import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';

  try {
    console.log(`🔄 ${currency} Alpha Vantage 실시간 환율 가져오기 시작...`);
    
    // Alpha Vantage API만 사용 (진정한 실시간 데이터)
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

                return NextResponse.json({
                  success: true,
                  message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Real-time Cross Rate)',
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed,
                  stored_data_count: storedData.length,
                  recent_rates: storedData.slice(0, 3).map(d => ({
                    rate: d.rate,
                    timestamp: d.timestamp
                  })),
                  real_time_calculation: {
                    eur_usd: { rate: eurUsdRate, timestamp: eurUsdTimestamp },
                    usd_krw: { rate: usdKrwRate, timestamp: usdKrwTimestamp },
                    formula: `${eurUsdRate} × ${usdKrwRate} = ${currentRate}`,
                    data_source: 'Alpha Vantage Real-time'
                  }
                });
              }
            }
          }
        }
        
        console.log('❌ Alpha Vantage EUR 크로스 환율 계산 실패');
        
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

                return NextResponse.json({
                  success: true,
                  message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
                  api_source: 'Alpha Vantage (Real-time Cross Rate)',
                  current_rate: currentRate,
                  last_refreshed: lastRefreshed,
                  stored_data_count: storedData.length,
                  recent_rates: storedData.slice(0, 3).map(d => ({
                    rate: d.rate,
                    timestamp: d.timestamp
                  })),
                  real_time_calculation: {
                    cny_usd: { rate: cnyUsdRate, timestamp: cnyUsdTimestamp },
                    usd_krw: { rate: usdKrwRate, timestamp: usdKrwTimestamp },
                    formula: `${cnyUsdRate} × ${usdKrwRate} = ${currentRate}`,
                    data_source: 'Alpha Vantage Real-time'
                  }
                });
              }
            }
          }
        }
        
        console.log('❌ Alpha Vantage CNY 크로스 환율 계산 실패');
        
      } else {
        // USD, JPY는 직접 환율
        const alphaUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        console.log(`📡 ${currency}/KRW 실시간 환율 요청...`);
        
        const response = await fetch(alphaUrl);
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 ${currency}/KRW API 응답:`, data);
          
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

            await saveForexData({
              currency: currency,
              rate: currentRate,
              timestamp: lastRefreshed
            });

            const storedData = await getForexData(currency, 5);

            return NextResponse.json({
              success: true,
              message: `${currency} Alpha Vantage 실시간 환율 업데이트 완료`,
              api_source: 'Alpha Vantage (Real-time Direct)',
              current_rate: currentRate,
              last_refreshed: lastRefreshed,
              stored_data_count: storedData.length,
              recent_rates: storedData.slice(0, 3).map(d => ({
                rate: d.rate,
                timestamp: d.timestamp
              })),
              real_time_info: {
                timestamp: exchangeData['6. Last Refreshed'],
                data_source: 'Alpha Vantage Real-time'
              }
            });
          }
        }
        
        console.log(`❌ Alpha Vantage ${currency}/KRW 직접 환율 실패`);
      }
    } catch (alphaError) {
      console.log('🚨 Alpha Vantage API 완전 실패:', alphaError);
    }

    // Alpha Vantage 실패 시에만 백업 사용 (실시간성은 떨어지지만 서비스 유지용)
    console.log('⚠️ Alpha Vantage 실시간 API 실패 - 백업 API 시도 중...');

    // CurrencyLayer API 시도 (상대적으로 신뢰할 수 있는 백업)
    try {
      const currencyLayerUrl = `http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_API_KEY}&currencies=KRW&source=${currency}&format=1`;
      console.log('📡 CurrencyLayer API 백업 호출 중...');
      
      const response = await fetch(currencyLayerUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.quotes && data.quotes[`${currency}KRW`]) {
          let currentRate = parseFloat(data.quotes[`${currency}KRW`].toFixed(2));
          
          // JPY는 1엔 기준 데이터를 100엔 기준으로 변환하여 저장
          if (currency === 'JPY') {
            currentRate = currentRate * 100;
            console.log(`🔄 JPY 환율 변환: 1엔 기준 → 100엔 기준 (${currentRate}원/100엔)`);
          }
          
          const lastRefreshed = new Date(data.timestamp * 1000).toISOString();
          
          console.log(`🛡️ CurrencyLayer ${currency}/KRW 백업 환율: ${currentRate}${currency === 'JPY' ? '원/100엔' : '원'}`);
          console.log(`⚠️ 주의: 실시간 Alpha Vantage API 실패로 백업 사용 중`);

          await saveForexData({
            currency: currency,
            rate: currentRate,
            timestamp: lastRefreshed
          });

          const storedData = await getForexData(currency, 5);

          return NextResponse.json({
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
          });
        }
      }
    } catch (currencyLayerError) {
      console.log('⚠️ CurrencyLayer 백업 API도 실패:', currencyLayerError);
    }

    // 한국은행 기준환율 (최후 백업)
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

          return NextResponse.json({
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
          });
        }
      }
    } catch (bokError) {
      console.log('⚠️ 한국은행 API도 실패:', bokError);
    }

    // 모든 API 실패 시 에러 반환
    throw new Error('모든 환율 API 접근 실패 (Alpha Vantage 실시간 포함)');

  } catch (error) {
    console.error('❌ 모든 환율 소스 완전 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        currency: currency,
        message: 'Alpha Vantage 실시간 API 및 모든 백업 API 실패 - 잠시 후 다시 시도해주세요'
      },
      { status: 500 }
    );
  }
} 