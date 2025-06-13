import { ForexData } from './supabase';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export async function getRealtimeForexRate(fromCurrency: string = 'USD', toCurrency: string = 'KRW'): Promise<ForexData> {
  try {
    console.log('🔍 Alpha Vantage API 호출 시작:', { fromCurrency, toCurrency });
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API 키가 설정되지 않았습니다.');
    }

    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('🌐 API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 API 응답:', data);
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (!data['Realtime Currency Exchange Rate']) {
      throw new Error('환율 데이터를 찾을 수 없습니다.');
    }

    const exchangeRate = data['Realtime Currency Exchange Rate'];
    
    return {
      id: 0,
      currency: fromCurrency,
      rate: parseFloat(exchangeRate['5. Exchange Rate']),
      timestamp: exchangeRate['6. Last Refreshed'],
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ 실시간 환율 조회 실패:', error);
    throw error;
  }
}

export async function getHistoricalForexRates(
  fromCurrency: string = 'USD',
  toCurrency: string = 'KRW',
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<ForexData[]> {
  try {
    console.log('🔍 Alpha Vantage API 호출 시작:', { fromCurrency, toCurrency, interval });
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API 키가 설정되지 않았습니다.');
    }

    const url = `${ALPHA_VANTAGE_BASE_URL}?function=FX_${interval.toUpperCase()}&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('🌐 API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 API 응답:', data);
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const timeSeriesKey = `Time Series FX (${interval})`;
    if (!data[timeSeriesKey]) {
      throw new Error('환율 데이터를 찾을 수 없습니다.');
    }

    const timeSeries = data[timeSeriesKey];

    return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      id: 0,
      currency: fromCurrency,
      rate: parseFloat(values['4. close']),
      timestamp: timestamp,
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error('❌ 과거 환율 조회 실패:', error);
    throw error;
  }
} 