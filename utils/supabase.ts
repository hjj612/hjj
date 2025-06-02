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
  const { data: result, error } = await supabase
    .from('forex_rates')
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
}

// 환율 데이터 조회
export async function getForexData(currency: string, days: number = 30) {
  const { data, error } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('currency', currency)
    .order('timestamp', { ascending: false })
    .limit(days);

  if (error) throw error;
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