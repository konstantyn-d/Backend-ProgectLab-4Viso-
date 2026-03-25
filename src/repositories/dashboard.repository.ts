import { supabase } from '../config/supabase'

export async function getActiveLanesCount() {
  const { count, error } = await supabase
    .from('lanes')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function getGdpCompliantPercent() {
  const { count: total, error: e1 } = await supabase
    .from('lanes')
    .select('*', { count: 'exact', head: true })
  if (e1) throw e1

  const { count: compliant, error: e2 } = await supabase
    .from('lanes')
    .select('*', { count: 'exact', head: true })
    .eq('gdp_compliant', true)
  if (e2) throw e2

  if (!total) return 0
  return Math.round(((compliant ?? 0) / total) * 1000) / 10
}

export async function getTemperatureDeviationsCount() {
  const since = new Date()
  since.setHours(since.getHours() - 24)

  const { count, error } = await supabase
    .from('temperature_readings')
    .select('*', { count: 'exact', head: true })
    .eq('is_deviation', true)
    .gte('recorded_at', since.toISOString())
  if (error) throw error
  return count ?? 0
}

export async function getHighRiskLanesCount() {
  const { count, error } = await supabase
    .from('lanes')
    .select('*', { count: 'exact', head: true })
    .gt('risk_score', 60)
  if (error) throw error
  return count ?? 0
}

export async function getCorridors() {
  const { data, error } = await supabase
    .from('lanes')
    .select('*, origin_port:ports!lanes_origin_port_id_fkey(country), dest_port:ports!lanes_dest_port_id_fkey(country)')

  if (error) throw error

  const corridorMap = new Map<
    string,
    { lanes: number; totalRisk: number; compliantCount: number }
  >()

  for (const lane of data ?? []) {
    const origin = (lane.origin_port as { country: string })?.country ?? 'Unknown'
    const dest = (lane.dest_port as { country: string })?.country ?? 'Unknown'
    const key = `${origin} → ${dest}`
    const existing = corridorMap.get(key) ?? { lanes: 0, totalRisk: 0, compliantCount: 0 }
    existing.lanes++
    existing.totalRisk += lane.risk_score ?? 0
    if (lane.gdp_compliant) existing.compliantCount++
    corridorMap.set(key, existing)
  }

  return Array.from(corridorMap.entries()).map(([corridor, stats]) => ({
    corridor,
    lanes: stats.lanes,
    avgRisk: Math.round(stats.totalRisk / stats.lanes),
    compliance: Math.round((stats.compliantCount / stats.lanes) * 1000) / 10,
    status:
      stats.compliantCount === stats.lanes
        ? 'compliant' as const
        : stats.compliantCount / stats.lanes >= 0.8
          ? 'warning' as const
          : 'critical' as const,
  }))
}
