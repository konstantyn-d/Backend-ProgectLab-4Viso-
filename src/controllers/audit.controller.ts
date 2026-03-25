import { Request, Response, NextFunction } from 'express'
import * as auditRepo from '../repositories/audit.repository'
import { auditQuerySchema } from '../validators/audit.validator'
import { toCsv } from '../services/export.service'

export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = auditQuerySchema.parse(req.query)
    const result = await auditRepo.getEvents({
      laneId: query.laneId,
      userId: query.userId,
      type: query.type,
      severity: query.severity,
      from: query.from,
      to: query.to,
      search: query.search,
      page: query.page,
      limit: query.limit,
    })
    res.json({ data: result.data, total: result.total, page: query.page })
  } catch (err) {
    next(err)
  }
}

export async function exportEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = auditQuerySchema.parse(req.query)
    const data = await auditRepo.getAllEvents({
      laneId: query.laneId,
      userId: query.userId,
      type: query.type,
      severity: query.severity,
      from: query.from,
      to: query.to,
      search: query.search,
    })

    const csv = toCsv(
      ['created_at', 'type', 'severity', 'title', 'description', 'lane_id', 'user_id'],
      data,
    )

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv')
    res.send(csv)
  } catch (err) {
    next(err)
  }
}
