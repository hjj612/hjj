import { NextResponse } from 'next/server';
import { getForexData } from '@/utils/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'USD';
    const limit = parseInt(searchParams.get('limit') || '30');

    console.log(`📊 ${currency} 환율 데이터 조회 (최근 ${limit}개)`);

    // Supabase에서 해당 통화의 환율 데이터 조회
    const data = await getForexData(currency, limit);

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: `${currency} 환율 데이터가 없습니다.`,
        data: []
      });
    }

    // 시간순으로 정렬 (오래된 것부터)
    const sortedData = data.reverse();

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