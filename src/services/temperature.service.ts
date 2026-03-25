import * as tempRepo from '../repositories/temperature.repository'
import * as laneRepo from '../repositories/lane.repository'
import * as auditService from './audit.service'
import { calculateRiskScore } from './risk.service'

export async function recordTemperature(laneId: string, value: number, userId: string, recordedAt?: string) {
  const lane = await laneRepo.getLaneById(laneId)
  if (!lane) throw new Error('Lane not found')

  const reading = await tempRepo.createReading({
    lane_id: laneId,
    value,
    recorded_at: recordedAt,
  })

  const isDeviation = value < lane.temp_min || value > lane.temp_max

  if (isDeviation) {
    const deviationAmount = value > lane.temp_max ? value - lane.temp_max : lane.temp_min - value
    const severity = deviationAmount > 2 ? 'critical' : 'warning'

    await auditService.logEvent({
      type: 'temperature_alert',
      severity,
      title: `Temperature deviation detected: ${value}°C`,
      description: `Temperature ${value}°C is outside range ${lane.temp_min}°C – ${lane.temp_max}°C`,
      laneId,
      userId,
      metadata: { value, min: lane.temp_min, max: lane.temp_max, deviationAmount },
    })

    const deviationCount = await tempRepo.countDeviations(laneId, 7)
    const carrier = lane.carrier as { gdp_certified?: boolean } | null

    const newRisk = calculateRiskScore({
      temperatureDeviations: deviationCount,
      carrierGdpCertified: carrier?.gdp_certified ?? false,
      productType: lane.product_type,
      routeDistance: 5000,
      currentDeviation: true,
    })

    const updates: Record<string, unknown> = {
      temp_current: value,
      risk_score: newRisk,
    }
    if (severity === 'critical') {
      updates.gdp_compliant = false
    }

    await laneRepo.updateLane(laneId, updates)
  } else {
    await laneRepo.updateLane(laneId, { temp_current: value })
  }

  return reading
}
