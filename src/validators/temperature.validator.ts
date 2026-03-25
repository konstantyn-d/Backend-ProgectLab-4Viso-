import { z } from 'zod'

export const createTemperatureSchema = z.object({
  value: z.number(),
  recordedAt: z.string().datetime().optional(),
})

export const temperatureQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day']).optional(),
})
