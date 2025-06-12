import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';
  const days = parseInt(searchParams.get('days') || '60');

  try {
    console.log(`🔄 ${currency}/KRW 실제 OHLC 데이터 가져오기 (${days}일)...`);
    
    // Alpha Vantage FX_DAILY API - 실제 OHLC 데이터
    const apiUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${currency}&to_symbol=KRW&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    
    console.log('📡 Alpha Vantage FX_DAILY API 호출...');
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log(`📊 ${currency}/KRW FX_DAILY API 응답 키:`, Object.keys(data));

    // API 응답 검증
    if (!data['Time Series FX (Daily)']) {
      if (data.Note) {
        console.log('⚠️ API 속도 제한:', data.Note);
        return NextResponse.json({
          success: false,
          error: 'API_RATE_LIMIT',
          message: 'Alpha Vantage API 속도 제한'
        });
      }
      throw new Error(`${currency}/KRW OHLC 데이터를 찾을 수 없습니다`);
    }

    const timeSeries = data['Time Series FX (Daily)'];
    const ohlcData = [];

    // 날짜별 OHLC 데이터 파싱
    for (const [date, values] of Object.entries(timeSeries)) {
      ohlcData.push({
        date: date,
        timestamp: new Date(date).toISOString(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close'])
      });
    }

    // 날짜순 정렬 (최신순)
    ohlcData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // 요청된 일수만큼 제한
    const limitedData = ohlcData.slice(0, days);
    
    // 다시 오래된 순으로 정렬 (차트용)
    limitedData.reverse();

    console.log(`✅ ${currency}/KRW 실제 OHLC 데이터 ${limitedData.length}개 수집 완료`);
    console.log(`📅 첫째날: ${limitedData[0]?.date} (종가: ${limitedData[0]?.close}원)`);
    console.log(`📅 마지막: ${limitedData[limitedData.length - 1]?.date} (종가: ${limitedData[limitedData.length - 1]?.close}원)`);

    return NextResponse.json({
      success: true,
      message: `${currency}/KRW 실제 OHLC 데이터 가져오기 완료`,
      currency: currency,
      api_source: 'Alpha Vantage FX_DAILY (Real OHLC)',
      count: limitedData.length,
      data: limitedData,
      data_info: {
        period: `${limitedData.length}일`,
        start_date: limitedData[0]?.date,
        end_date: limitedData[limitedData.length - 1]?.date,
        has_real_ohlc: true
      }
    });

  } catch (error) {
    console.error(`❌ ${currency}/KRW OHLC 데이터 가져오기 실패:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: `${currency}/KRW OHLC 데이터 가져오기 중 오류 발생`
      },
      { status: 500 }
    );
  }
} 