import { NextResponse } from 'next/server';
import { saveForexData } from '@/utils/supabase';

const CURRENCIES = ['USD', 'JPY', 'EUR', 'CNY'];

// API 호출 한도 관리를 위한 캐시
const updateCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

function isUpdateNeeded(): boolean {
  const lastUpdate = updateCache.get('last_update');
  if (!lastUpdate) return true;
  
  const now = Date.now();
  return (now - lastUpdate) > CACHE_DURATION;
}

function setLastUpdate() {
  updateCache.set('last_update', Date.now());
}

export async function GET() {
  try {
    console.log('🔄 자동 환율 업데이트 시작...');
    
    // 캐시 체크 (5분 내에 이미 업데이트했다면 스킵)
    if (!isUpdateNeeded()) {
      console.log('⏭️ 최근에 업데이트됨 - 스킵');
      return NextResponse.json({
        success: true,
        message: '최근에 업데이트됨 (5분 캐시)',
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // 모든 통화에 대해 순차적으로 업데이트
    for (const currency of CURRENCIES) {
      try {
        console.log(`📡 ${currency} 환율 업데이트 중...`);
        
        // Alpha Vantage API 호출
        const alphaUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        
        const response = await fetch(alphaUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API 한도 초과 체크
        if (data['Note']) {
          console.log(`⚠️ Alpha Vantage API 한도 초과: ${data['Note']}`);
          throw new Error(`API 호출 한도 초과: ${data['Note']}`);
        }
        
        const exchangeData = data['Realtime Currency Exchange Rate'];
        
        if (exchangeData) {
          let currentRate = parseFloat(exchangeData['5. Exchange Rate']);
          
          // JPY는 1엔 기준 데이터를 100엔 기준으로 변환
          if (currency === 'JPY') {
            currentRate = currentRate * 100;
          }
          
          const lastRefreshed = new Date(exchangeData['6. Last Refreshed']).toISOString();
          
          console.log(`✅ ${currency} 환율 업데이트 성공: ${currentRate}원`);
          
          // Supabase에 저장
          await saveForexData({
            currency: currency,
            rate: currentRate,
            timestamp: lastRefreshed
          });
          
          results.push({
            currency,
            success: true,
            rate: currentRate,
            timestamp: lastRefreshed,
            api_source: 'Alpha Vantage'
          });
          
          successCount++;
        } else {
          throw new Error('환율 데이터를 찾을 수 없습니다');
        }
        
        // API 호출 간격 (1초 대기)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ ${currency} 환율 업데이트 실패:`, error);
        
        results.push({
          currency,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
        
        errorCount++;
      }
    }
    
    // 마지막 업데이트 시간 기록
    setLastUpdate();
    
    console.log(`🎉 자동 환율 업데이트 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
    
    return NextResponse.json({
      success: true,
      message: '자동 환율 업데이트 완료',
      timestamp: new Date().toISOString(),
      summary: {
        total: CURRENCIES.length,
        success: successCount,
        error: errorCount
      },
      results: results
    });
    
  } catch (error) {
    console.error('❌ 자동 환율 업데이트 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '자동 환율 업데이트 실패',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST 요청도 지원 (수동 트리거용)
export async function POST() {
  // 캐시 무시하고 강제 업데이트
  updateCache.delete('last_update');
  return GET();
} 