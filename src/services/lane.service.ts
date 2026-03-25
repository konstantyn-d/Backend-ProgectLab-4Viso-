import * as laneRepo from '../repositories/lane.repository'
import * as carrierRepo from '../repositories/carrier.repository'
import * as auditService from './audit.service'
import { calculateRiskScore } from './risk.service'

interface CreateLaneInput {
  originPortId: string
  destPortId: string
  carrierId: string
  mode: string
  productType: string
  tempMin: number
  tempMax: number
  userId: string
}

export async function createLane(input: CreateLaneInput) {
  const carrier = await carrierRepo.getCarrierById(input.carrierId)
  const carrierRaw = carrier as unknown as { gdp_certified?: boolean } | null

  const riskScore = calculateRiskScore({
    temperatureDeviations: 0,
    carrierGdpCertified: carrierRaw?.gdp_certified ?? false,
    productType: input.productType,
    routeDistance: 5000,
    currentDeviation: false,
  })

  const lane = await laneRepo.createLane({
    origin_port_id: input.originPortId,
    dest_port_id: input.destPortId,
    carrier_id: input.carrierId,
    mode: input.mode,
    product_type: input.productType,
    temp_min: input.tempMin,
    temp_max: input.tempMax,
    subscribed_by: input.userId,
    risk_score: riskScore,
  })

  await auditService.logEvent({
    type: 'lane_created',
    severity: 'info',
    title: 'New transport lane created',
    description: `Lane ${lane.id} created`,
    laneId: lane.id,
    userId: input.userId,
  })

  return lane
}

export async function removeLane(id: string, userId: string) {
  await auditService.logEvent({
    type: 'lane_updated',
    severity: 'info',
    title: 'Lane deleted',
    description: `Lane ${id} was deleted`,
    laneId: id,
    userId,
  })

  await laneRepo.deleteLane(id)
}
