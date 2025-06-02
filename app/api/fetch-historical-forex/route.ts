import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function fetchHistoricalForexData(fromCurrency: string) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=KRW&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.data || !response.data['Time Series FX (Daily)']) {
      throw new Error(`Invalid response format for ${fromCurrency}/KRW`);
    }

    const timeSeries = response.data['Time Series FX (Daily)'];
    const historicalData = [];

    // 최근 90일 데이터만 사용
    const dates = Object.keys(timeSeries).slice(0, 90);
    
    for (const date of dates) {
      historicalData.push({
        currency: fromCurrency,
        rate: parseFloat(timeSeries[date]['4. close']),
        timestamp: new Date(date).toISOString()
      });
    }

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${fromCurrency}/KRW:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Non-Axios error:', error);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'USD';

    // 데이터베이스에서 기존 데이터 조회
    const { data: existingData, error: dbError } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency', currency)
      .order('timestamp', { ascending: true })
      .limit(90);

    if (dbError) {
      throw dbError;
    }

    // 데이터가 있으면 그대로 반환
    if (existingData ? existingData.length > 0 : false) {
      return NextResponse.json(existingData);
    }

    // 데이터가 없으면 API에서 가져오기
    console.log('Starting historical forex data fetch...');
    console.log('Using API Key:', ALPHA_VANTAGE_API_KEY ? 'Present' : 'Missing');

    const currencies = currency === 'ALL' ? ['USD', 'JPY', 'CNY', 'EUR'] : [currency];
    const allData = [];

    for (const curr of currencies) {
      console.log(`Processing ${curr}...`);
      try {
        console.log(`Fetching historical data for ${curr}/KRW...`);
        const historicalData = await fetchHistoricalForexData(curr);
        console.log(`Fetched ${historicalData.length} historical records for ${curr}`);

        // 데이터베이스에 저장
        const { error: insertError } = await supabase
          .from('forex_rates')
          .insert(historicalData);

        if (insertError) {
          console.error(`Error saving ${curr} historical data:`, insertError);
          throw insertError;
        }

        console.log(`Successfully saved ${curr} historical data`);
        allData.push(...historicalData);

        // API 호출 간 간격 두기
        if (curr !== currencies[currencies.length - 1]) {
          console.log('Waiting for rate limit...');
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch (error) {
        console.error(`Error processing ${curr}:`, error);
        throw error;
      }
    }

    return NextResponse.json(
      currency === 'ALL' ? allData : allData.filter(d => d.currency === currency)
    );

  } catch (error) {
    console.error('Error in historical forex data fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical forex data' },
      { status: 500 }
    );
  }
} 