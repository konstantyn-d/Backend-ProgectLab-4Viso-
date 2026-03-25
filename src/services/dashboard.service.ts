import * as dashRepo from '../repositories/dashboard.repository'
import type { DashboardKPIs, CorridorStatus } from '../types'

export async function getKPIs(): Promise<DashboardKPIs> {
  const [activeLanes, gdpPercent, temperatureDeviations, highRiskLanes] = await Promise.all([
    dashRepo.getActiveLanesCount(),
    dashRepo.getGdpCompliantPercent(),
    dashRepo.getTemperatureDeviationsCount(),
    dashRepo.getHighRiskLanesCount(),
  ])

  return { activeLanes, gdpPercent, temperatureDeviations, highRiskLanes }
}

export async function getCorridors(): Promise<CorridorStatus[]> {
  return dashRepo.getCorridors()
}
