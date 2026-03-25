import { z } from 'zod'
import { paginationQuery } from './common'

export const createLaneSchema = z.object({
  originPortId: z.string().uuid(),
  destPortId: z.string().uuid(),
  carrierId: z.string().uuid(),
  mode: z.enum(['air', 'sea', 'road', 'multimodal']),
  productType: z.enum(['vaccines', 'biologics', 'api', 'other']),
  tempMin: z.number(),
  tempMax: z.number(),
  notifications: z.object({
    emailOnDeviation: z.boolean(),
    pushOnStatusChange: z.boolean(),
    dailyDigest: z.boolean(),
    highRiskAlerts: z.boolean(),
  }),
}).refine((data) => data.tempMin < data.tempMax, {
  message: 'tempMin must be less than tempMax',
})

export const lanesQuerySchema = paginationQuery.extend({
  mode: z.enum(['air', 'sea', 'road', 'multimodal']).optional(),
  status: z.enum(['departure', 'in_transit', 'customs', 'arrived']).optional(),
  risk_min: z.coerce.number().min(0).max(100).optional(),
  risk_max: z.coerce.number().min(0).max(100).optional(),
  search: z.string().optional(),
})
