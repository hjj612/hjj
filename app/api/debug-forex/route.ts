import { NextResponse } from 'next/server';
import { getForexData } from '@/utils/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';

  try {
    console.log(`🔍 ${currency} 환율 API 디버그 시작...`);
    
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      currency: currency,
      environment: {
        node_env: process.env.NODE_ENV,
        alpha_vantage_key_exists: !!process.env.ALPHA_VANTAGE_API_KEY,
        alpha_vantage_key_length: process.env.ALPHA_VANTAGE_API_KEY?.length || 0,
        supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      api_tests: {}
    };

    // 1. Supabase 연결 테스트
    try {
      console.log('📊 Supabase 연결 테스트...');
      const storedData = await getForexData(currency, 10);
      debugInfo.api_tests.supabase = {
        success: true,
        data_count: storedData.length,
        latest_data: storedData[0] ? {
          rate: storedData[0].rate,
          timestamp: storedData[0].timestamp,
          days_ago: Math.floor((new Date().getTime() - new Date(storedData[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
        } : null,
        all_data: storedData.map(d => ({
          rate: d.rate,
          timestamp: d.timestamp
        }))
      };
    } catch (error) {
      debugInfo.api_tests.supabase = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 2. Alpha Vantage API 테스트
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      try {
        console.log('📡 Alpha Vantage API 테스트...');
        const testUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=KRW&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        
        const response = await fetch(testUrl);
        const data = await response.json();
        
        debugInfo.api_tests.alpha_vantage = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          has_data: !!data['Realtime Currency Exchange Rate'],
          error_message: data['Error Message'] || null,
          note: data['Note'] || null,
          response_data: data
        };
      } catch (error) {
        debugInfo.api_tests.alpha_vantage = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      debugInfo.api_tests.alpha_vantage = {
        success: false,
        error: 'API key not configured'
      };
    }

    // 3. ExchangeRate-API 테스트 (폴백)
    try {
      console.log('📡 ExchangeRate-API 테스트...');
      const fallbackUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`;
      const response = await fetch(fallbackUrl);
      const data = await response.json();
      
      debugInfo.api_tests.exchange_rate_api = {
        success: response.ok,
        status: response.status,
        has_krw_rate: !!(data.rates && data.rates.KRW),
        krw_rate: data.rates?.KRW || null,
        base_currency: data.base,
        date: data.date
      };
    } catch (error) {
      debugInfo.api_tests.exchange_rate_api = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 4. CurrencyLayer API 테스트
    if (process.env.CURRENCY_LAYER_API_KEY) {
      try {
        console.log('📡 CurrencyLayer API 테스트...');
        const currencyLayerUrl = `http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_API_KEY}&currencies=KRW&source=${currency}&format=1`;
        const response = await fetch(currencyLayerUrl);
        const data = await response.json();
        
        debugInfo.api_tests.currency_layer = {
          success: data.success || false,
          has_quotes: !!(data.quotes && data.quotes[`${currency}KRW`]),
          krw_rate: data.quotes?.[`${currency}KRW`] || null,
          error: data.error || null
        };
      } catch (error) {
        debugInfo.api_tests.currency_layer = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      debugInfo.api_tests.currency_layer = {
        success: false,
        error: 'API key not configured'
      };
    }

    // 5. 한국은행 API 테스트
    if (process.env.BOK_API_KEY) {
      try {
        console.log('📡 한국은행 API 테스트...');
        const bokDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const bokUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${process.env.BOK_API_KEY}/json/kr/1/1/036Y001/DD/${bokDate}/${bokDate}/${currency === 'USD' ? 'USD' : currency === 'JPY' ? 'JPY' : currency === 'EUR' ? 'EUR' : 'CNY'}`;
        
        const response = await fetch(bokUrl);
        const data = await response.json();
        
        debugInfo.api_tests.bok = {
          success: !!(data.StatisticSearch && data.StatisticSearch.row && data.StatisticSearch.row.length > 0),
          has_data: !!(data.StatisticSearch && data.StatisticSearch.row && data.StatisticSearch.row.length > 0),
          rate: data.StatisticSearch?.row?.[0]?.DATA_VALUE || null,
          error: data.RESULT?.CODE || null
        };
      } catch (error) {
        debugInfo.api_tests.bok = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      debugInfo.api_tests.bok = {
        success: false,
        error: 'API key not configured'
      };
    }

    // 6. 문제 진단
    const diagnosis = {
      issues: [],
      recommendations: []
    };

    // Supabase 문제 체크
    if (!debugInfo.api_tests.supabase.success) {
      diagnosis.issues.push('Supabase 연결 실패');
      diagnosis.recommendations.push('Supabase 환경 변수 확인 필요');
    }

    // Alpha Vantage 문제 체크
    if (!debugInfo.api_tests.alpha_vantage.success) {
      if (debugInfo.api_tests.alpha_vantage.error_message) {
        diagnosis.issues.push(`Alpha Vantage API 오류: ${debugInfo.api_tests.alpha_vantage.error_message}`);
      }
      if (debugInfo.api_tests.alpha_vantage.note) {
        diagnosis.issues.push(`Alpha Vantage 제한: ${debugInfo.api_tests.alpha_vantage.note}`);
        diagnosis.recommendations.push('API 호출 한도 초과 - 다음날까지 대기 또는 유료 계정 고려');
      }
    }

    // 저장된 데이터 오래됨 체크
    if (debugInfo.api_tests.supabase.success && debugInfo.api_tests.supabase.latest_data) {
      const daysAgo = debugInfo.api_tests.supabase.latest_data.days_ago;
      if (daysAgo > 1) {
        diagnosis.issues.push(`저장된 데이터가 ${daysAgo}일 전 데이터입니다`);
        diagnosis.recommendations.push('API 호출이 실패하고 있어 최신 데이터를 가져올 수 없습니다');
      }
    }

    // 폴백 API 체크
    if (!debugInfo.api_tests.exchange_rate_api.success) {
      diagnosis.issues.push('ExchangeRate-API 폴백도 실패');
      diagnosis.recommendations.push('네트워크 연결 또는 API 서비스 문제 가능성');
    }

    debugInfo.diagnosis = diagnosis;

    return NextResponse.json({
      success: true,
      message: `${currency} 환율 API 디버그 완료`,
      debug_info: debugInfo
    });

  } catch (error) {
    console.error('❌ 디버그 API 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '디버그 API 실행 실패',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 