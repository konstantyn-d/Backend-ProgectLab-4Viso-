import { supabase } from '../config/supabase'

interface LaneFilters {
  mode?: string
  status?: string
  riskMin?: number
  riskMax?: number
  search?: string
  page: number
  limit: number
  userId?: string
}

export async function getLanes(filters: LaneFilters) {
  let query = supabase
    .from('lanes')
    .select(
      '*, origin_port:ports!lanes_origin_port_id_fkey(*), dest_port:ports!lanes_dest_port_id_fkey(*), carrier:carriers!lanes_carrier_id_fkey(*)',
      { count: 'exact' },
    )

  if (filters.userId) query = query.eq('subscribed_by', filters.userId)
  if (filters.mode) query = query.eq('mode', filters.mode)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.riskMin !== undefined) query = query.gte('risk_score', filters.riskMin)
  if (filters.riskMax !== undefined) query = query.lte('risk_score', filters.riskMax)
  if (filters.search) {
    query = query.or(
      `origin_port.code.ilike.%${filters.search}%,dest_port.code.ilike.%${filters.search}%`,
    )
  }

  const offset = (filters.page - 1) * filters.limit
  query = query.range(offset, offset + filters.limit - 1).order('created_at', { ascending: false })

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getLaneById(id: string) {
  const { data, error } = await supabase
    .from('lanes')
    .select(
      '*, origin_port:ports!lanes_origin_port_id_fkey(*), dest_port:ports!lanes_dest_port_id_fkey(*), carrier:carriers!lanes_carrier_id_fkey(*)',
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createLane(lane: {
  origin_port_id: string
  dest_port_id: string
  carrier_id: string
  mode: string
  product_type: string
  temp_min: number
  temp_max: number
  subscribed_by: string
  risk_score: number
}) {
  const { data, error } = await supabase.from('lanes').insert(lane).select().single()
  if (error) throw error
  return data
}

export async function deleteLane(id: string) {
  const { error } = await supabase.from('lanes').delete().eq('id', id)
  if (error) throw error
}

export async function updateLane(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('lanes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
