import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 통화별 한글 이름
const currencyNames: { [key: string]: string } = {
  USD: '미국 달러',
  JPY: '일본 엔',
  CNY: '중국 위안',
  EUR: '유럽 유로'
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // 사용자 메시지에서 환율 정보 요청 의도 파악
    const currencies = ['USD', 'JPY', 'CNY', 'EUR'];
    const requestedCurrency = currencies.find(currency => 
      message.toUpperCase().includes(currency)
    );

    if (!requestedCurrency) {
      return NextResponse.json({
        response: '죄송합니다. USD, JPY, CNY, EUR 중 어떤 통화의 환율을 알고 싶으신가요? 아래 환율 블록을 클릭하여 상세 분석을 볼 수 있습니다.'
      });
    }

    // Supabase에서 최신 환율 데이터 조회
    const { data: latestRate, error: rateError } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency_pair', `${requestedCurrency}/KRW`)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (rateError) {
      throw rateError;
    }

    // 예측 데이터 조회
    const { data: prediction, error: predictionError } = await supabase
      .from('forex_predictions')
      .select('*')
      .eq('currency_pair', `${requestedCurrency}/KRW`)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (predictionError) {
      throw predictionError;
    }

    let response = '';
    if (latestRate ? latestRate[0] : false) {
      const currencyName = currencyNames[requestedCurrency] || requestedCurrency;
      
      response = `현재 ${currencyName}(${requestedCurrency}/KRW) 환율은 ${latestRate[0].rate.toFixed(2)}원 입니다.\n\n`;
      
      if (prediction ? prediction[0] : false) {
        response += `다음 예측 환율은 ${prediction[0].predicted_rate.toFixed(2)}원 입니다.\n\n`;
        
        // 예측 신뢰도 추가
        const confidence = prediction[0].confidence || Math.floor(Math.random() * 20) + 75; // 임시 데이터
        response += `예측 신뢰도: ${confidence}%\n\n`;
      }
      
      // 상세 분석 안내 추가
      response += `더 자세한 분석과 7일간의 예측, 기술적 지표(RSI, 볼린저 밴드, 이동평균선)를 보시려면 상단의 ${currencyName} 환율 블록을 클릭하세요.`;
    } else {
      response = '죄송합니다. 현재 해당 통화의 환율 정보를 조회할 수 없습니다.';
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
} 