import { supabase } from '../config/supabase'
import type { Carrier } from '../types'

export async function getAllCarriers(): Promise<Carrier[]> {
  const { data, error } = await supabase.from('carriers').select('*').order('name')
  if (error) throw error
  return data as Carrier[]
}

export async function getCarrierById(id: string): Promise<Carrier | null> {
  const { data, error } = await supabase.from('carriers').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') throw error
  return data as Carrier | null
}
