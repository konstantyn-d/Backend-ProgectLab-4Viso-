import { Request, Response, NextFunction } from 'express'
import * as complianceRepo from '../repositories/compliance.repository'
import * as complianceService from '../services/compliance.service'
import { complianceQuerySchema, createComplianceSchema } from '../validators/compliance.validator'
import { toCsv } from '../services/export.service'

export async function getRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const query = complianceQuerySchema.parse(req.query)
    const result = await complianceRepo.getRecords({
      laneId: query.laneId,
      carrierId: query.carrierId,
      from: query.from,
      to: query.to,
      page: query.page,
      limit: query.limit,
    })
    res.json({ data: result.data, total: result.total, page: query.page })
  } catch (err) {
    next(err)
  }
}

export async function createRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createComplianceSchema.parse(req.body)
    const record = await complianceService.createRecord({
      laneId: body.laneId,
      score: body.score,
      gdpStatus: body.gdpStatus,
      notes: body.notes,
      openIssues: body.openIssues,
      userId: req.user!.id,
    })
    res.status(201).json(record)
  } catch (err) {
    next(err)
  }
}

export async function exportRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const query = complianceQuerySchema.parse(req.query)
    const result = await complianceRepo.getRecords({
      laneId: query.laneId,
      carrierId: query.carrierId,
      from: query.from,
      to: query.to,
      page: 1,
      limit: 10000,
    })

    const csv = toCsv(
      ['lane_id', 'score', 'gdp_status', 'audited_at', 'open_issues', 'notes'],
      result.data,
    )

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.csv')
    res.send(csv)
  } catch (err) {
    next(err)
  }
}
