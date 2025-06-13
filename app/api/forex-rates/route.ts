import { NextResponse } from 'next/server';
import { getForexData, saveForexData } from '@/utils/supabase';
import { getRealtimeForexRate, getHistoricalForexRates } from '@/utils/alpha-vantage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'USD';
    const limit = parseInt(searchParams.get('limit') || '30');

    console.log(`📊 ${currency} 환율 데이터 조회 시작 (최근 ${limit}개)`);

    // 실시간 환율 가져오기
    console.log('🔄 실시간 환율 조회 중...');
    const realtimeRate = await getRealtimeForexRate(currency, 'KRW');
    console.log('✅ 실시간 환율 조회 완료:', realtimeRate);
    
    // 실시간 환율을 Supabase에 저장
    console.log('💾 Supabase에 환율 데이터 저장 중...');
    await saveForexData({
      currency: realtimeRate.currency,
      rate: realtimeRate.rate,
      timestamp: realtimeRate.timestamp
    });
    console.log('✅ 환율 데이터 저장 완료');

    // Supabase에서 해당 통화의 환율 데이터 조회
    console.log('📥 Supabase에서 환율 데이터 조회 중...');
    const data = await getForexData(currency, limit);
    console.log('✅ 환율 데이터 조회 완료');

    if (!data || data.length === 0) {
      console.log('⚠️ 환율 데이터가 없습니다.');
      return NextResponse.json({
        success: false,
        message: `${currency} 환율 데이터가 없습니다.`,
        data: []
      });
    }

    // 시간순으로 정렬 (오래된 것부터)
    const sortedData = data.reverse();
    console.log(`✅ 총 ${sortedData.length}개의 환율 데이터 반환`);

    return NextResponse.json({
      success: true,
      message: `${currency} 환율 데이터 조회 완료`,
      currency: currency,
      count: sortedData.length,
      data: sortedData
    });

  } catch (error) {
    console.error('❌ 환율 데이터 조회 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '환율 데이터 조회 중 오류 발생'
      },
      { status: 500 }
    );
  }
} 