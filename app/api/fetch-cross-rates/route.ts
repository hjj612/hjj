import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'JPY';

  try {
    console.log(`🔄 ${currency}/KRW 크로스 환율 계산 시작...`);
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API 키가 설정되지 않았습니다');
    }

    // 1. USD/KRW 환율 가져오기
    console.log('📡 USD/KRW 환율 조회...');
    const usdKrwUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const usdKrwResponse = await fetch(usdKrwUrl);
    const usdKrwData = await usdKrwResponse.json();
    
    if (usdKrwData['Error Message'] || usdKrwData['Note']) {
      throw new Error(`USD/KRW API 오류: ${usdKrwData['Error Message'] || usdKrwData['Note']}`);
    }

    const usdKrwRate = parseFloat(usdKrwData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    console.log(`💰 USD/KRW: ${usdKrwRate}원`);

    // 2. USD/{currency} 환율 가져오기 (예: USD/JPY)
    console.log(`📡 USD/${currency} 환율 조회...`);
    const usdCurrencyUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=${currency}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const usdCurrencyResponse = await fetch(usdCurrencyUrl);
    const usdCurrencyData = await usdCurrencyResponse.json();
    
    if (usdCurrencyData['Error Message'] || usdCurrencyData['Note']) {
      throw new Error(`USD/${currency} API 오류: ${usdCurrencyData['Error Message'] || usdCurrencyData['Note']}`);
    }

    const usdCurrencyRate = parseFloat(usdCurrencyData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    console.log(`💱 USD/${currency}: ${usdCurrencyRate}`);

    // 3. {currency}/KRW 환율 계산
    // 예: JPY/KRW = USD/KRW ÷ USD/JPY
    const currencyKrwRate = usdKrwRate / usdCurrencyRate;
    const lastRefreshed = usdKrwData['Realtime Currency Exchange Rate']['6. Last Refreshed'];
    
    console.log(`✅ 계산된 ${currency}/KRW 환율: ${currencyKrwRate.toFixed(2)}원`);

    // 4. Supabase에 저장
    const forexData = {
      currency: currency,
      rate: Math.round(currencyKrwRate * 100) / 100, // 소수점 2자리
      timestamp: new Date(lastRefreshed).toISOString()
    };

    await saveForexData(forexData);
    console.log(`💾 ${currency} Supabase에 데이터 저장 완료`);

    // 5. 최근 데이터 조회해서 확인
    const storedData = await getForexData(currency, 5);

    return NextResponse.json({
      success: true,
      message: `${currency} 크로스 환율 계산 및 저장 완료`,
      calculation: {
        usd_krw_rate: usdKrwRate,
        usd_currency_rate: usdCurrencyRate,
        calculated_rate: currencyKrwRate,
        formula: `${currency}/KRW = USD/KRW ÷ USD/${currency}`
      },
      current_rate: currencyKrwRate,
      last_refreshed: lastRefreshed,
      stored_data_count: storedData.length,
      recent_rates: storedData.slice(0, 3).map(d => ({
        rate: d.rate,
        timestamp: d.timestamp
      }))
    });

  } catch (error) {
    console.error(`❌ ${currency} 크로스 환율 계산 실패:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        currency: currency,
        fallback_message: '크로스 환율 계산 실패'
      },
      { status: 500 }
    );
  }
} 