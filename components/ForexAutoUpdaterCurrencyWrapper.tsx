'use client';
import ForexAutoUpdater from './ForexAutoUpdater';

export default function ForexAutoUpdaterCurrencyWrapper({ currencyCode, onUpdate }) {
  return (
    <ForexAutoUpdater
      currencies={[currencyCode]}
      autoUpdateInterval={15}
      onUpdate={onUpdate}
    />
  );
} 