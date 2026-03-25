# PharmaTrack — Backend Developer Brief

## Project Overview

You are building the backend API for PharmaTrack — an enterprise 
platform for monitoring pharmaceutical supply chain logistics 
for 4Viso, a Belgian compliance and risk assessment company.

The backend serves a Next.js frontend dashboard. It handles 
transport lane management, temperature/compliance monitoring, 
audit logging, and risk scoring for pharmaceutical shipments.

This is a production-grade API. Security, data integrity, 
and auditability are non-negotiable given the pharmaceutical 
regulatory context (GDP/GMP compliance requirements).

---

## Tech Stack

- Runtime:      Node.js 20 (LTS)
- Language:     TypeScript (strict mode)
- Framework:    Express.js
- Database:     Supabase (PostgreSQL via Supabase client)
- Auth:         Supabase Auth — verify JWT tokens on every 
                protected route
- Validation:   Zod (all request bodies and query params)
- Logging:      Winston (structured JSON logs)
- Testing:      Vitest + Supertest
- Linting:      ESLint + Prettier

---

## Project Structure



---

## Database Schema (Supabase PostgreSQL)

Run these migrations in Supabase SQL editor:
```sql
-- Users (managed by Supabase Auth, extend with profiles)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer' 
              CHECK (role IN ('admin', 'operator', 'viewer')),
  company     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ports/Locations
CREATE TABLE ports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,   -- IATA or UN/LOCODE
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  country     TEXT NOT NULL,
  type        TEXT NOT NULL 
              CHECK (type IN ('air', 'sea', 'road', 'multimodal'))
);

-- Carriers
CREATE TABLE carriers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  gdp_certified BOOLEAN DEFAULT FALSE,
  modes       TEXT[] NOT NULL,        -- ['air', 'sea']
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Transport Lanes
CREATE TABLE lanes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_port_id  UUID NOT NULL REFERENCES ports(id),
  dest_port_id    UUID NOT NULL REFERENCES ports(id),
  carrier_id      UUID NOT NULL REFERENCES carriers(id),
  mode            TEXT NOT NULL 
                  CHECK (mode IN ('air','sea','road','multimodal')),
  status          TEXT NOT NULL DEFAULT 'departure'
                  CHECK (status IN 
                  ('departure','in_transit','customs','arrived')),
  product_type    TEXT NOT NULL 
                  CHECK (product_type IN 
                  ('vaccines','biologics','api','other')),
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

-- Temperature Readings (time series)
CREATE TABLE temperature_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id     UUID NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
  value       DECIMAL(5,2) NOT NULL,
  is_deviation BOOLEAN GENERATED ALWAYS AS (
                value < (
                  SELECT temp_min FROM lanes WHERE id = lane_id
                ) OR value > (
                  SELECT temp_max FROM lanes WHERE id = lane_id
                )
              ) STORED,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id       UUID NOT NULL REFERENCES lanes(id),
  carrier_id    UUID NOT NULL REFERENCES carriers(id),
  departure_at  TIMESTAMPTZ NOT NULL,
  eta           TIMESTAMPTZ NOT NULL,
  arrived_at    TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN 
                ('active','in_transit','delivered','delayed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE compliance_records (
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

-- Audit Log (append-only, never update or delete)
CREATE TABLE audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN (
                'temperature_alert', 'compliance_check',
                'lane_created', 'lane_updated',
                'shipment_event', 'user_action')),
  severity    TEXT NOT NULL 
              CHECK (severity IN 
              ('critical','warning','success','info')),
  title       TEXT NOT NULL,
  description TEXT,
  lane_id     UUID REFERENCES lanes(id),
  user_id     UUID REFERENCES auth.users(id),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Audit log is immutable — no UPDATE or DELETE allowed
-- Enforce with RLS policy

-- Row Level Security
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own lanes" ON lanes
  FOR ALL USING (subscribed_by = auth.uid());

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No delete on audit" ON audit_events
  FOR DELETE USING (FALSE);
CREATE POLICY "No update on audit" ON audit_events
  FOR UPDATE USING (FALSE);
```

---

## API Endpoints — Full Specification

### Auth middleware (all routes except /auth/*)
```typescript
// middleware/auth.ts
// Extract Bearer token from Authorization header
// Verify with supabase.auth.getUser(token)
// Attach user to req.user
// Return 401 if invalid or missing
```

### Dashboard



GET /api/dashboard/kpis
Response: {
activeLanes: number,
gdpPercent: number,
temperatureDeviations: number,
highRiskLanes: number
}
Queries: COUNT active lanes, AVG gdp_compliant,
COUNT deviations in last 24h, COUNT risk_score > 60
GET /api/dashboard/corridors
Response: CorridorStatus[] — grouped by
origin country + destination region


--



### Lanes
GET /api/lanes
Query params (all optional):
mode:     'air' | 'sea' | 'road' | 'multimodal'
status:   'departure' | 'in_transit' | 'customs' | 'arrived'
risk_min: number (0–100)
risk_max: number (0–100)
search:   string (searches route codes and carrier name)
page:     number (default 1)
limit:    number (default 20, max 100)
Response: { data: Lane[], total: number, page: number }
GET /api/lanes/:id
Response: Lane (with joined port and carrier data)
POST /api/lanes
Body (Zod validated):
{
originPortId:    string (UUID)
destPortId:      string (UUID)
carrierId:       string (UUID)
mode:            'air' | 'sea' | 'road' | 'multimodal'
productType:     'vaccines' | 'biologics' | 'api' | 'other'
tempMin:         number
tempMax:         number
notifications: {
emailOnDeviation:   boolean
pushOnStatusChange: boolean
dailyDigest:        boolean
highRiskAlerts:     boolean
}
}
On create:

Insert lane record
Calculate initial risk score (risk.service.ts)
Insert audit_event type='lane_created'
Return created lane
Response: Lane (201)

DELETE /api/lanes/:id
Auth: only subscribed_by user or admin
On delete:

Insert audit_event type='lane_updated'
with description 'Lane deleted'
Soft delete (add deleted_at column, filter in queries)
Response: 204


### Temperature (sub-resource of lanes)
GET /api/lanes/:id/temperature
Query: from (ISO date), to (ISO date), interval ('hour'|'day')
Response: { readings: TemperatureReading[], deviations: number }
POST /api/lanes/:id/temperature
Body: { value: number, recordedAt: string }
On insert:

Insert temperature_reading
If deviation:
a. Update lanes.gdp_compliant if severe
b. Recalculate risk_score
c. Insert audit_event type='temperature_alert'
severity='critical' if >2°C over threshold,
severity='warning' if <2°C over threshold
Response: TemperatureReading (201)


### Shipments
GET /api/shipments
Query: laneId (filter), status, page, limit
Response: { data: Shipment[], total: number }
GET /api/shipments/:id
Response: Shipment (with lane info)

### Compliance
GET /api/compliance
Query: laneId, carrierId, from, to
Response: ComplianceRecord[]
GET /api/compliance/export
Query: same as above
Response: CSV file (Content-Type: text/csv)
Columns: Lane ID, Route, Carrier, Score, GDP Status,
Last Audit, Open Issues
POST /api/compliance
Body: { laneId, score, gdpStatus, notes, openIssues }
On create:
Insert audit_event type='compliance_check'
Update lanes.gdp_compliant based on score

### Audit Log
GET /api/audit
Query params:
laneId:    UUID (filter by lane)
userId:    UUID (filter by user)
type:      event type filter
severity:  severity filter
from:      ISO date
to:        ISO date
search:    text search in title + description
page:      number
limit:     number (default 20)
Response: { data: AuditEvent[], total: number }
GET /api/audit/export
Same query params → CSV download
Columns: Timestamp, Type, Severity, Title,
Description, Lane ID, User, Metadata

---

## Risk Score Calculation (risk.service.ts)

Risk score is 0–100 integer. Calculated on lane creation 
and recalculated on temperature deviation.
```typescript
export function calculateRiskScore(factors: {
  temperatureDeviations: number  // count in last 7 days
  carrierGdpCertified:   boolean
  productType:           string
  routeDistance:         number  // km approximate
  currentDeviation:      boolean
}): number {
  let score = 0
  
  // Temperature history (max 40 points)
  score += Math.min(factors.temperatureDeviations * 8, 40)
  
  // Carrier certification (20 points)
  if (!factors.carrierGdpCertified) score += 20
  
  // Product sensitivity (20 points)
  const sensitivity = { 
    vaccines: 20, biologics: 15, api: 10, other: 5 
  }
  score += sensitivity[factors.productType] ?? 5
  
  // Route distance (max 10 points)
  score += Math.min(Math.floor(factors.routeDistance / 1000), 10)
  
  // Active deviation (10 points)
  if (factors.currentDeviation) score += 10
  
  return Math.min(score, 100)
}
```

---

## Error Handling

All errors go through `middleware/errorHandler.ts`.
Consistent error response format:
```typescript
interface ApiError {
  status:  number
  code:    string     // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
  message: string
  details?: unknown   // Zod validation details
}
```

HTTP status codes:
- 400: Validation error (Zod)
- 401: Missing or invalid auth token
- 403: Authenticated but not authorized (wrong user, wrong role)
- 404: Resource not found
- 409: Conflict (duplicate lane, etc.)
- 500: Internal server error (never expose stack trace)

---

## Audit Logging Rule

Every state-changing operation MUST write to audit_events.
This is non-negotiable for pharmaceutical compliance.
```typescript
// services/audit.service.ts
export async function logEvent(event: {
  type:        AuditEventType
  severity:    AuditSeverity
  title:       string
  description: string
  laneId?:     string
  userId:      string
  metadata?:   Record<string, unknown>
}): Promise<void> {
  await supabase.from('audit_events').insert(event)
  // Never throw — audit must not break the main operation
  // Log to Winston if insert fails
}
```

Call `logEvent` in every controller that mutates data.

---

## Environment Variables
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   ← admin key, never expose to client
SUPABASE_JWT_SECRET=

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

---

## Startup & Scripts
```json
{
  "scripts": {
    "dev":    "tsx watch src/index.ts",
    "build":  "tsc",
    "start":  "node dist/index.js",
    "test":   "vitest",
    "lint":   "eslint src --ext .ts"
  }
}
```

Express app setup:
```typescript
// src/index.ts
app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())
app.use(requestLogger)
app.use('/api', routes)
app.use(errorHandler)
```

---

## Code Quality Rules

- TypeScript strict mode — zero `any`
- All DB queries go through repository layer — 
  no direct Supabase calls in controllers
- All inputs validated with Zod before hitting service layer
- All audit-generating operations call logEvent()
- No raw SQL strings — use Supabase query builder
- Repository functions return typed results, 
  never raw Supabase responses
- Services handle business logic only — 
  no HTTP request/response objects
- Controllers handle HTTP only — 
  no business logic, no DB calls