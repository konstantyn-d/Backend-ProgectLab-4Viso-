export type TransportMode = 'air' | 'sea' | 'road' | 'multimodal'
export type LaneStatus = 'departure' | 'in_transit' | 'customs' | 'arrived'
export type ProductType = 'vaccines' | 'biologics' | 'api' | 'other'
export type ShipmentStatus = 'active' | 'in_transit' | 'delivered' | 'delayed'
export type AuditEventType =
  | 'temperature_alert'
  | 'compliance_check'
  | 'lane_created'
  | 'lane_updated'
  | 'shipment_event'
  | 'user_action'
export type AuditSeverity = 'critical' | 'warning' | 'success' | 'info'

export interface Port {
  id: string
  code: string
  name: string
  city: string
  country: string
  type: TransportMode
}

export interface Carrier {
  id: string
  name: string
  gdpCertified: boolean
  modes: TransportMode[]
  createdAt: string
}

export interface Lane {
  id: string
  originPortId: string
  destPortId: string
  carrierId: string
  mode: TransportMode
  status: LaneStatus
  productType: ProductType
  tempMin: number
  tempMax: number
  tempCurrent: number | null
  gdpCompliant: boolean
  riskScore: number
  progressStep: number
  subscribedBy: string
  createdAt: string
  updatedAt: string
  origin?: Port
  destination?: Port
  carrier?: Carrier
}

export interface TemperatureReading {
  id: string
  laneId: string
  value: number
  isDeviation: boolean
  recordedAt: string
}

export interface Shipment {
  id: string
  laneId: string
  carrierId: string
  departureAt: string
  eta: string
  arrivedAt: string | null
  status: ShipmentStatus
  createdAt: string
  lane?: Lane
  carrier?: Carrier
}

export interface ComplianceRecord {
  id: string
  laneId: string
  score: number
  gdpStatus: boolean
  auditedAt: string
  auditedBy: string | null
  openIssues: number
  notes: string | null
}

export interface AuditEvent {
  id: string
  type: AuditEventType
  severity: AuditSeverity
  title: string
  description: string | null
  laneId: string | null
  userId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface CorridorStatus {
  corridor: string
  lanes: number
  avgRisk: number
  compliance: number
  status: 'compliant' | 'warning' | 'critical'
}

export interface DashboardKPIs {
  activeLanes: number
  gdpPercent: number
  temperatureDeviations: number
  highRiskLanes: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
}
