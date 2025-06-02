import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 환경변수 테스트 중...');
    
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      success: true,
      message: '환경변수 테스트 완료',
      env_status: {
        alpha_vantage_key: {
          present: !!alphaVantageKey,
          length: alphaVantageKey?.length || 0,
          first_4_chars: alphaVantageKey?.substring(0, 4) || 'N/A'
        },
        supabase_url: {
          present: !!supabaseUrl,
          length: supabaseUrl?.length || 0
        },
        supabase_key: {
          present: !!supabaseKey,
          length: supabaseKey?.length || 0,
          first_10_chars: supabaseKey?.substring(0, 10) || 'N/A'
        }
      },
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 환경변수 테스트 실패:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '환경변수 테스트 실패'
      },
      { status: 500 }
    );
  }
} 