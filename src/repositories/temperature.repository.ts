import { supabase } from '../config/supabase'

export async function getReadings(
  laneId: string,
  from?: string,
  to?: string,
) {
  let query = supabase
    .from('temperature_readings')
    .select('*')
    .eq('lane_id', laneId)
    .order('recorded_at', { ascending: true })

  if (from) query = query.gte('recorded_at', from)
  if (to) query = query.lte('recorded_at', to)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createReading(reading: {
  lane_id: string
  value: number
  recorded_at?: string
}) {
  const { data, error } = await supabase
    .from('temperature_readings')
    .insert(reading)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function countDeviations(laneId: string, sinceDays: number) {
  const since = new Date()
  since.setDate(since.getDate() - sinceDays)

  const { count, error } = await supabase
    .from('temperature_readings')
    .select('*', { count: 'exact', head: true })
    .eq('lane_id', laneId)
    .eq('is_deviation', true)
    .gte('recorded_at', since.toISOString())

  if (error) throw error
  return count ?? 0
}
