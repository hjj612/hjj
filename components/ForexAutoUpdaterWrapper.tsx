'use client';
import ForexAutoUpdater from './ForexAutoUpdater';

export default function ForexAutoUpdaterWrapper() {
  return (
    <ForexAutoUpdater
      currencies={['USD', 'JPY', 'EUR', 'CNY']}
      autoUpdateInterval={30}
      onUpdate={(data) => {
        console.log(`🔄 환율 업데이트 완료: ${data.currency} = ${data.rate}원`);
      }}
    />
  );
} 