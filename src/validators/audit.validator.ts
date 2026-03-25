import { z } from 'zod'
import { paginationQuery } from './common'

export const auditQuerySchema = paginationQuery.extend({
  laneId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  type: z
    .enum([
      'temperature_alert',
      'compliance_check',
      'lane_created',
      'lane_updated',
      'shipment_event',
      'user_action',
    ])
    .optional(),
  severity: z.enum(['critical', 'warning', 'success', 'info']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
})
