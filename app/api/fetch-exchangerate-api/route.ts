import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'JPY';

  try {
    console.log(`🔄 ${currency}/KRW 실제 환율 가져오기 (ExchangeRate-API)...`);
    
    // ExchangeRate-API 사용 (무료, API 키 불필요)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`;
    
    console.log('📡 ExchangeRate-API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log(`📊 ${currency} ExchangeRate-API 응답:`, data);

    if (!data.rates || !data.rates.KRW) {
      throw new Error(`${currency}/KRW 환율 데이터를 찾을 수 없습니다`);
    }

    const currentRate = data.rates.KRW;
    const lastRefreshed = new Date().toISOString(); // ExchangeRate-API는 타임스탬프를 제공하지 않으므로 현재 시간 사용
    
    console.log(`✅ 실제 ${currency}/KRW 환율: ${currentRate}원`);

    // Supabase에 새로운 환율 데이터 저장
    const forexData = {
      currency: currency,
      rate: Math.round(currentRate * 100) / 100, // 소수점 2자리
      timestamp: lastRefreshed
    };

    await saveForexData(forexData);
    console.log('💾 Supabase에 데이터 저장 완료');

    // 최근 데이터 조회해서 확인
    const storedData = await getForexData(currency, 5);

    return NextResponse.json({
      success: true,
      message: `${currency} 실제 환율 업데이트 완료`,
      api_source: 'ExchangeRate-API',
      current_rate: currentRate,
      last_refreshed: lastRefreshed,
      stored_data_count: storedData.length,
      recent_rates: storedData.slice(0, 3).map(d => ({
        rate: d.rate,
        timestamp: d.timestamp
      })),
      exchange_info: {
        base_currency: currency,
        target_currency: 'KRW',
        api_updated: data.date || 'Unknown'
      }
    });

  } catch (error) {
    console.error(`❌ ${currency} 실제 환율 가져오기 실패:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        currency: currency,
        api_source: 'ExchangeRate-API',
        fallback_message: '실제 환율 데이터 가져오기 실패'
      },
      { status: 500 }
    );
  }
} 