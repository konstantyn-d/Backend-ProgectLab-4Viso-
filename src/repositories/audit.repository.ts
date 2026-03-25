import { supabase } from '../config/supabase'
import type { AuditEventType, AuditSeverity } from '../types'

interface AuditFilters {
  laneId?: string
  userId?: string
  type?: AuditEventType
  severity?: AuditSeverity
  from?: string
  to?: string
  search?: string
  page: number
  limit: number
}

export async function getEvents(filters: AuditFilters) {
  let query = supabase
    .from('audit_events')
    .select('*', { count: 'exact' })

  if (filters.laneId) query = query.eq('lane_id', filters.laneId)
  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.severity) query = query.eq('severity', filters.severity)
  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to)
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const offset = (filters.page - 1) * filters.limit
  query = query.range(offset, offset + filters.limit - 1).order('created_at', { ascending: false })

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getAllEvents(filters: Omit<AuditFilters, 'page' | 'limit'>) {
  let query = supabase
    .from('audit_events')
    .select('*')

  if (filters.laneId) query = query.eq('lane_id', filters.laneId)
  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.severity) query = query.eq('severity', filters.severity)
  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to)
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function insertEvent(event: {
  type: string
  severity: string
  title: string
  description?: string
  lane_id?: string
  user_id?: string
  metadata?: Record<string, unknown>
}) {
  const { error } = await supabase.from('audit_events').insert(event)
  if (error) throw error
}
