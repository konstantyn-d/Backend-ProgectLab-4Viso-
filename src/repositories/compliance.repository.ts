import { supabase } from '../config/supabase'

interface ComplianceFilters {
  laneId?: string
  carrierId?: string
  from?: string
  to?: string
  page: number
  limit: number
}

export async function getRecords(filters: ComplianceFilters) {
  let query = supabase
    .from('compliance_records')
    .select('*, lane:lanes(*, origin_port:ports!lanes_origin_port_id_fkey(*), dest_port:ports!lanes_dest_port_id_fkey(*), carrier:carriers!lanes_carrier_id_fkey(*))', { count: 'exact' })

  if (filters.laneId) query = query.eq('lane_id', filters.laneId)
  if (filters.from) query = query.gte('audited_at', filters.from)
  if (filters.to) query = query.lte('audited_at', filters.to)

  const offset = (filters.page - 1) * filters.limit
  query = query.range(offset, offset + filters.limit - 1).order('audited_at', { ascending: false })

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function createRecord(record: {
  lane_id: string
  score: number
  gdp_status: boolean
  audited_by: string
  open_issues: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('compliance_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}
