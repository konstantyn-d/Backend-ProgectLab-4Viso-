-- PharmaTrack Initial Schema
-- Run this in Supabase SQL Editor

-- Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('admin', 'operator', 'viewer')),
  company     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ports/Locations
CREATE TABLE IF NOT EXISTS ports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  country     TEXT NOT NULL,
  type        TEXT NOT NULL
              CHECK (type IN ('air', 'sea', 'road', 'multimodal'))
);

-- Carriers
CREATE TABLE IF NOT EXISTS carriers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  gdp_certified   BOOLEAN DEFAULT FALSE,
  modes           TEXT[] NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Transport Lanes
CREATE TABLE IF NOT EXISTS lanes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_port_id  UUID NOT NULL REFERENCES ports(id),
  dest_port_id    UUID NOT NULL REFERENCES ports(id),
  carrier_id      UUID NOT NULL REFERENCES carriers(id),
  mode            TEXT NOT NULL
                  CHECK (mode IN ('air', 'sea', 'road', 'multimodal')),
  status          TEXT NOT NULL DEFAULT 'departure'
                  CHECK (status IN ('departure', 'in_transit', 'customs', 'arrived')),
  product_type    TEXT NOT NULL
                  CHECK (product_type IN ('vaccines', 'biologics', 'api', 'other')),
  temp_min        DECIMAL(5,2) NOT NULL,
  temp_max        DECIMAL(5,2) NOT NULL,
  temp_current    DECIMAL(5,2),
  gdp_compliant   BOOLEAN DEFAULT TRUE,
  risk_score      INTEGER DEFAULT 0
                  CHECK (risk_score BETWEEN 0 AND 100),
  progress_step   INTEGER DEFAULT 1
                  CHECK (progress_step BETWEEN 1 AND 4),
  subscribed_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Temperature Readings
CREATE TABLE IF NOT EXISTS temperature_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id     UUID NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
  value       DECIMAL(5,2) NOT NULL,
  is_deviation BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id       UUID NOT NULL REFERENCES lanes(id),
  carrier_id    UUID NOT NULL REFERENCES carriers(id),
  departure_at  TIMESTAMPTZ NOT NULL,
  eta           TIMESTAMPTZ NOT NULL,
  arrived_at    TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'in_transit', 'delivered', 'delayed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE IF NOT EXISTS compliance_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id     UUID NOT NULL REFERENCES lanes(id),
  score       INTEGER NOT NULL
              CHECK (score BETWEEN 0 AND 100),
  gdp_status  BOOLEAN NOT NULL,
  audited_at  TIMESTAMPTZ DEFAULT NOW(),
  audited_by  UUID REFERENCES auth.users(id),
  open_issues INTEGER DEFAULT 0,
  notes       TEXT
);

-- Audit Events (append-only)
CREATE TABLE IF NOT EXISTS audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN (
                'temperature_alert', 'compliance_check',
                'lane_created', 'lane_updated',
                'shipment_event', 'user_action')),
  severity    TEXT NOT NULL
              CHECK (severity IN ('critical', 'warning', 'success', 'info')),
  title       TEXT NOT NULL,
  description TEXT,
  lane_id     UUID REFERENCES lanes(id),
  user_id     UUID REFERENCES auth.users(id),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
CREATE POLICY "Service role full access on lanes" ON lanes
  FOR ALL USING (true);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on audit_events" ON audit_events
  FOR ALL USING (true);

CREATE POLICY "No delete on audit" ON audit_events
  FOR DELETE USING (FALSE);

-- Enable RLS on other tables with permissive policies for service role
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on ports" ON ports FOR ALL USING (true);

ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on carriers" ON carriers FOR ALL USING (true);

ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on temperature_readings" ON temperature_readings FOR ALL USING (true);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on shipments" ON shipments FOR ALL USING (true);

ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on compliance_records" ON compliance_records FOR ALL USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on profiles" ON profiles FOR ALL USING (true);
