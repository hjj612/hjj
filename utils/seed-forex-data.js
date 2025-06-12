const { createClient } = require('@supabase/supabase-js');

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 통화별 기본 환율 (2024년 5월 23일 기준 실제 환율)
const baseRates = {
  JPY: 902,       // 100 JPY = 902 KRW (100엔당 원화값으로 표시)
  CNY: 188.45,    // 1 CNY = 188.45 KRW
  EUR: 1485.67    // 1 EUR = 1485.67 KRW
};

async function seedForexData() {
  console.log('🌱 환율 데이터 시딩 시작...');

  for (const [currency, baseRate] of Object.entries(baseRates)) {
    try {
      console.log(`📊 ${currency} 데이터 생성 중...`);

      // 지난 7일간의 데이터 생성 (약간의 변동 포함)
      const dataPoints = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(9 + Math.floor(Math.random() * 8)); // 9-17시 랜덤
        date.setMinutes(Math.floor(Math.random() * 60));
        date.setSeconds(Math.floor(Math.random() * 60));

        // 기본 환율에서 ±2% 변동
        const variation = (Math.random() - 0.5) * 0.04; // -2% ~ +2%
        const rate = baseRate * (1 + variation);

        dataPoints.push({
          currency: currency,
          rate: Math.round(rate * 100) / 100, // 소수점 2자리
          timestamp: date.toISOString()
        });
      }

      // Supabase에 데이터 삽입
      const { data, error } = await supabase
        .from('forex_rates')
        .insert(dataPoints);

      if (error) {
        console.error(`❌ ${currency} 데이터 삽입 실패:`, error);
      } else {
        console.log(`✅ ${currency} 데이터 ${dataPoints.length}개 생성 완료`);
        console.log(`   현재 환율: ${dataPoints[dataPoints.length - 1].rate}원`);
      }

    } catch (error) {
      console.error(`💥 ${currency} 처리 중 오류:`, error);
    }
  }

  console.log('🎉 모든 통화 데이터 시딩 완료!');
}

// 기존 데이터 확인
async function checkExistingData() {
  console.log('🔍 기존 데이터 확인 중...');
  
  for (const currency of Object.keys(baseRates)) {
    const { data, error } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency', currency)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error(`❌ ${currency} 데이터 조회 오류:`, error);
    } else if (data && data.length > 0) {
      console.log(`📊 ${currency} 기존 데이터 존재: ${data[0].rate}원 (${data[0].timestamp})`);
    } else {
      console.log(`📭 ${currency} 데이터 없음 - 새로 생성 필요`);
    }
  }
}

// 실행
async function main() {
  await checkExistingData();
  console.log('\n');
  await seedForexData();
}

main().catch(console.error);