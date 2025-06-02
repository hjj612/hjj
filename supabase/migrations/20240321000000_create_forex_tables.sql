-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all access for forex_rates" ON forex_rates;
DROP POLICY IF EXISTS "Enable all access for forex_predictions" ON forex_predictions;

-- Drop existing tables
DROP TABLE IF EXISTS forex_rates;
DROP TABLE IF EXISTS forex_predictions;

-- Create forex_rates table
CREATE TABLE IF NOT EXISTS forex_rates (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    currency text NOT NULL,
    rate numeric NOT NULL,
    timestamp timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create forex_predictions table
CREATE TABLE IF NOT EXISTS forex_predictions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    currency text NOT NULL,
    predicted_rate numeric NOT NULL,
    confidence numeric NOT NULL,
    prediction_date date NOT NULL,
    target_date date NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forex_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forex_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for full access
CREATE POLICY "Enable all access for forex_rates"
    ON forex_rates
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for forex_predictions"
    ON forex_predictions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS forex_rates_currency_timestamp_idx 
    ON forex_rates(currency, timestamp);
CREATE INDEX IF NOT EXISTS forex_predictions_currency_target_date_idx 
    ON forex_predictions(currency, target_date);

-- Grant access to authenticated users
GRANT ALL ON forex_rates TO authenticated;
GRANT ALL ON forex_predictions TO authenticated;
GRANT USAGE ON SEQUENCE forex_rates_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE forex_predictions_id_seq TO authenticated; 