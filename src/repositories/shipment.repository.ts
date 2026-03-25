import { supabase } from '../config/supabase'

interface ShipmentFilters {
  laneId?: string
  status?: string
  page: number
  limit: number
}

export async function getShipments(filters: ShipmentFilters) {
  let query = supabase
    .from('shipments')
    .select('*, lane:lanes(*), carrier:carriers(*)', { count: 'exact' })

  if (filters.laneId) query = query.eq('lane_id', filters.laneId)
  if (filters.status) query = query.eq('status', filters.status)

  const offset = (filters.page - 1) * filters.limit
  query = query.range(offset, offset + filters.limit - 1).order('created_at', { ascending: false })

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getShipmentById(id: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*, lane:lanes(*, origin_port:ports!lanes_origin_port_id_fkey(*), dest_port:ports!lanes_dest_port_id_fkey(*)), carrier:carriers(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
