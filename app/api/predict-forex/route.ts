import { NextResponse } from 'next/server';
import { PythonShell } from 'python-shell';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'USD';

    // 최근 90일 데이터 조회
    const { data: historicalData, error } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency', currency)
      .order('timestamp', { ascending: true })
      .limit(90);

    if (error) {
      throw error;
    }

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No historical data found'
      }, { status: 404 });
    }

    // Python 스크립트 실행
    const scriptPath = path.join(process.cwd(), 'predict_forex.py');
    console.log('Script path:', scriptPath);
    console.log('Historical data:', JSON.stringify(historicalData).slice(0, 100) + '...');

    const options = {
      mode: 'text' as const,
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: process.cwd(),
      args: [JSON.stringify(historicalData)]
    };

    // Python 스크립트 실행
    const result = await new Promise<string>((resolve, reject) => {
      let pyshell = new PythonShell('predict_forex.py', options);
      
      let output: string[] = [];
      
      pyshell.on('message', function (message) {
        output.push(message);
      });
      
      pyshell.end(function (err) {
        if (err) {
          console.error('Python script error:', err);
          reject(err);
          return;
        }
        if (!output || output.length === 0) {
          reject(new Error('No output from Python script'));
          return;
        }
        resolve(output[output.length - 1]);
      });
    });

    // 예측 결과 파싱
    const predictions = JSON.parse(result);

    // 예측 결과 저장
    for (const prediction of predictions) {
      await supabase.from('forex_predictions').insert({
        currency,
        predicted_rate: prediction.predicted_rate,
        confidence: prediction.confidence,
        prediction_date: new Date().toISOString().split('T')[0],
        target_date: prediction.target_date
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Forex predictions generated successfully',
      data: predictions,
      metadata: {
        currency,
        prediction_date: new Date().toISOString(),
        historical_data_points: historicalData.length
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to generate predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 