import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    // Supabase 연결 테스트
    const { data, error } = await supabase
      .from('forex_rates')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Failed to connect to Supabase',
          error: error.message,
          hint: 'Please check your environment variables'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      data: data || []
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to run test',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 