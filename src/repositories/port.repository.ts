import { supabase } from '../config/supabase'
import type { Port } from '../types'

export async function getAllPorts(): Promise<Port[]> {
  const { data, error } = await supabase.from('ports').select('*').order('code')
  if (error) throw error
  return data as Port[]
}

export async function getPortById(id: string): Promise<Port | null> {
  const { data, error } = await supabase.from('ports').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') throw error
  return data as Port | null
}
