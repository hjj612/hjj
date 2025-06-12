const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUSDData() {
  console.log('🔍 USD 환율 데이터 확인 중...');
  
  try {
    // 최근 USD 데이터 조회
    const { data, error } = await supabase
      .from('forex_rates')
      .select('*')
      .eq('currency', 'USD')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ 데이터 조회 오류:', error);
      return;
    }

    console.log(`📊 USD 데이터 ${data.length}개 발견:`);
    data.forEach((item, index) => {
      const date = new Date(item.timestamp).toLocaleString('ko-KR');
      console.log(`${index + 1}. ${item.rate}원 (${date})`);
    });

    if (data.length > 0) {
      const latest = data[0];
      console.log(`\n✅ 최신 USD 환율: ${latest.rate}원`);
      console.log(`⏰ 마지막 업데이트: ${new Date(latest.timestamp).toLocaleString('ko-KR')}`);
      
      // 1320.5원인지 확인
      if (latest.rate === 1320.5) {
        console.log('⚠️  여전히 기본값(1320.5원)이 최신 데이터입니다!');
      } else {
        console.log('✅ 실제 API 데이터가 저장되어 있습니다.');
      }
    } else {
      console.log('❌ USD 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('💥 스크립트 실행 오류:', error);
  }
}

checkUSDData(); 