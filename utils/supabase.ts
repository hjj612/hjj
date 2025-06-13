import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 환율 데이터 타입 정의
export interface ForexData {
  id: number;
  currency: string;
  rate: number;
  timestamp: string;
  created_at: string;
}

// 예측 데이터 타입 정의
export interface PredictionData {
  id: number;
  currency: string;
  predicted_rate: number;
  confidence: number;
  prediction_date: string;
  target_date: string;
  created_at: string;
}

// 환율 데이터 저장
export async function saveForexData(data: Omit<ForexData, 'id' | 'created_at'>) {
  console.log('💾 saveForexData 함수 실행:', data);
  
  try {
    // 1. 동일한 timestamp의 기존 데이터 확인
    const { data: existingData, error: checkError } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency', data.currency)
      .eq('timestamp', data.timestamp)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116는 데이터가 없을 때의 에러
      console.error('❌ 기존 데이터 확인 중 에러:', checkError);
      throw checkError;
    }

    if (existingData) {
      console.log('ℹ️ 동일한 timestamp의 데이터가 이미 존재합니다. 업데이트를 진행합니다.');
      // 기존 데이터 업데이트
      const { data: updatedData, error: updateError } = await supabase
        .from('forex_rates')
        .update({ rate: data.rate })
        .eq('id', existingData.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ 데이터 업데이트 실패:', updateError);
        throw updateError;
      }

      console.log('✅ 데이터 업데이트 성공:', updatedData);
      return updatedData;
    }

    // 2. 새로운 데이터 삽입
    const { data: newData, error: insertError } = await supabase
      .from('forex_rates')
      .insert([data])
      .select()
      .single();

    if (insertError) {
      console.error('❌ 데이터 삽입 실패:', insertError);
      throw insertError;
    }

    console.log('✅ 새로운 데이터 삽입 성공:', newData);
    return newData;
  } catch (error) {
    console.error('❌ saveForexData 함수 실행 중 에러:', error);
    throw error;
  }
}

// 환율 데이터 조회
export async function getForexData(currency: string, days: number = 30) {
  console.log(`📥 getForexData 함수 실행: currency=${currency}, days=${days}`);
  
  const { data, error } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('currency', currency)
    .order('timestamp', { ascending: false })
    .limit(days);

  if (error) {
    console.error('❌ Supabase 조회 에러:', error);
    throw error;
  }
  
  console.log(`✅ Supabase 조회 결과: ${data ? data.length : 0}개 데이터`);
  if (data && data.length > 0) {
    console.log('📊 최근 데이터:', data[0]);
  }
  
  return data;
}

// 예측 데이터 저장
export async function savePrediction(data: Omit<PredictionData, 'id' | 'created_at'>) {
  const { data: result, error } = await supabase
    .from('forex_predictions')
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
}

// 예측 데이터 조회
export async function getPredictions(currency: string) {
  const { data, error } = await supabase
    .from('forex_predictions')
    .select('*')
    .eq('currency', currency)
    .gte('target_date', new Date().toISOString())
    .order('target_date', { ascending: true });

  if (error) throw error;
  return data;
} 