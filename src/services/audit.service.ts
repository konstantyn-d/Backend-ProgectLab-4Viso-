import * as auditRepo from '../repositories/audit.repository'
import { logger } from '../middleware/requestLogger'
import type { AuditEventType, AuditSeverity } from '../types'

export async function logEvent(event: {
  type: AuditEventType
  severity: AuditSeverity
  title: string
  description?: string
  laneId?: string
  userId?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await auditRepo.insertEvent({
      type: event.type,
      severity: event.severity,
      title: event.title,
      description: event.description,
      lane_id: event.laneId,
      user_id: event.userId,
      metadata: event.metadata,
    })
  } catch (err) {
    logger.error('Failed to write audit event', { error: err, event })
  }
}
