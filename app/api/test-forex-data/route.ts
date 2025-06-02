import { NextResponse } from 'next/server';
import { saveForexData, getForexData } from '@/utils/supabase';

export async function GET() {
  try {
    // 테스트 데이터 생성 및 저장
    const testData = {
      currency: 'USD',
      rate: 1320.50,
      timestamp: new Date().toISOString()
    };

    // 데이터 저장
    const savedData = await saveForexData(testData);
    console.log('Saved test data:', savedData);

    // 저장된 데이터 조회
    const retrievedData = await getForexData('USD', 10);
    
    return NextResponse.json({
      status: 'success',
      message: 'Forex data test completed',
      savedData,
      retrievedData,
      testDetails: {
        dataInserted: !!savedData,
        dataRetrieved: retrievedData.length > 0,
        recentRates: retrievedData.map(d => ({
          rate: d.rate,
          timestamp: d.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Forex data test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to test forex data operations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 