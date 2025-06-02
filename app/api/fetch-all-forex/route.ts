import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const CURRENCIES = ['USD', 'JPY', 'CNY', 'EUR'];

export async function GET() {
  const results = [];
  const errors = [];

  try {
    console.log('🔄 모든 통화 환율 데이터 업데이트 시작...');
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API 키가 설정되지 않았습니다');
    }

    for (const currency of CURRENCIES) {
      try {
        console.log(`📡 ${currency} 환율 가져오기...`);
        
        // Alpha Vantage에서 실시간 환율 가져오기
        const apiUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${ALPHA_VANTAGE_API_KEY}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log(`📊 ${currency} Alpha Vantage 응답:`, data);

        if (data['Error Message'] || data['Note']) {
          throw new Error(`${currency} API 오류: ${data['Error Message'] || data['Note']}`);
        }

        const exchangeRateData = data['Realtime Currency Exchange Rate'];
        
        if (!exchangeRateData) {
          throw new Error(`${currency} 환율 데이터를 찾을 수 없습니다`);
        }

        const currentRate = parseFloat(exchangeRateData['5. Exchange Rate']);
        const lastRefreshed = exchangeRateData['6. Last Refreshed'];
        
        console.log(`✅ ${currency}/KRW 환율: ${currentRate}원`);

        // Supabase에 새로운 환율 데이터 저장
        const forexData = {
          currency: currency,
          rate: currentRate,
          timestamp: new Date(lastRefreshed).toISOString()
        };

        await saveForexData(forexData);
        console.log(`💾 ${currency} Supabase 저장 완료`);

        // 최근 데이터 조회해서 확인
        const storedData = await getForexData(currency, 5);

        results.push({
          currency,
          success: true,
          current_rate: currentRate,
          last_refreshed: lastRefreshed,
          stored_data_count: storedData.length,
          recent_rates: storedData.slice(0, 3).map(d => ({
            rate: d.rate,
            timestamp: d.timestamp
          }))
        });

        // API 제한 고려 (12초 대기 - Alpha Vantage free tier)
        if (currency !== CURRENCIES[CURRENCIES.length - 1]) {
          console.log(`⏳ API 제한 대기 중... (12초)`);
          await new Promise(resolve => setTimeout(resolve, 12000));
        }

      } catch (error) {
        console.error(`❌ ${currency} 데이터 가져오기 실패:`, error);
        errors.push({
          currency,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = CURRENCIES.length;

    return NextResponse.json({
      success: errors.length === 0,
      message: `환율 업데이트 완료: ${successCount}/${totalCount} 성공`,
      timestamp: new Date().toISOString(),
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total_currencies: totalCount,
        successful: successCount,
        failed: errors.length,
        currencies_updated: results.map(r => r.currency)
      }
    });

  } catch (error) {
    console.error('❌ 전체 환율 업데이트 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '환율 업데이트 중 치명적 오류 발생',
        partial_results: results.length > 0 ? results : undefined
      },
      { status: 500 }
    );
  }
} 