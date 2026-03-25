import { z } from 'zod'
import { paginationQuery } from './common'

export const createComplianceSchema = z.object({
  laneId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  gdpStatus: z.boolean(),
  notes: z.string().optional(),
  openIssues: z.number().int().min(0).default(0),
})

export const complianceQuerySchema = paginationQuery.extend({
  laneId: z.string().uuid().optional(),
  carrierId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})
