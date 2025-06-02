import { NextResponse } from 'next/server';
import axios from 'axios';
import { getForexData } from '@/utils/supabase';

const CURRENCIES = ['USD', 'JPY', 'CNY', 'EUR'];
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function fetchCurrentRate(fromCurrency: string) {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=KRW&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data ? response.data['Realtime Currency Exchange Rate'] : false) {
      const data = response.data['Realtime Currency Exchange Rate'];
      return {
        rate: parseFloat(data['5. Exchange Rate']),
        lastRefreshed: data['6. Last Refreshed'],
        timeZone: data['7. Time Zone']
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching current rate for ${fromCurrency}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const verificationResults = [];

    for (const currency of CURRENCIES) {
      try {
        // 1. Supabase에서 저장된 최근 데이터 가져오기
        const storedData = await getForexData(currency, 5);
        
        // 2. Alpha Vantage에서 현재 환율 가져오기
        const currentRate = await fetchCurrentRate(currency);

        // 3. 데이터 비교 및 결과 저장
        const result = {
          currency,
          status: 'success',
          storedData: {
            available: storedData.length > 0,
            count: storedData.length,
            latestRate: storedData[0]?.rate,
            latestTimestamp: storedData[0]?.timestamp,
            recentRates: storedData.map(d => ({
              rate: d.rate,
              timestamp: d.timestamp
            }))
          },
          currentAlphaVantageRate: currentRate,
          dataVerification: {
            hasStoredData: storedData.length > 0,
            hasCurrentRate: currentRate !== null,
            ratesDifference: currentRate ? (storedData[0] 
              ? Math.abs(currentRate.rate - storedData[0].rate)
              : null) : null
          }
        };

        verificationResults.push(result);

        // Alpha Vantage API 제한 고려
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (error) {
        verificationResults.push({
          currency,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      verificationResults,
      summary: {
        totalCurrenciesChecked: CURRENCIES.length,
        successfulVerifications: verificationResults.filter(r => r.status === 'success').length,
        failedVerifications: verificationResults.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to verify forex data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 