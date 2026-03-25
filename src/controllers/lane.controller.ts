import { Request, Response, NextFunction } from 'express'
import * as laneRepo from '../repositories/lane.repository'
import * as laneService from '../services/lane.service'
import { lanesQuerySchema, createLaneSchema } from '../validators/lane.validator'
import { uuidParam } from '../validators/common'
import { AppError } from '../middleware/errorHandler'

export async function getLanes(req: Request, res: Response, next: NextFunction) {
  try {
    const query = lanesQuerySchema.parse(req.query)
    const result = await laneRepo.getLanes({
      mode: query.mode,
      status: query.status,
      riskMin: query.risk_min,
      riskMax: query.risk_max,
      search: query.search,
      page: query.page,
      limit: query.limit,
    })
    res.json({ data: result.data, total: result.total, page: query.page })
  } catch (err) {
    next(err)
  }
}

export async function getLaneById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = uuidParam.parse(req.params.id)
    const lane = await laneRepo.getLaneById(id)
    if (!lane) throw new AppError(404, 'NOT_FOUND', 'Lane not found')
    res.json(lane)
  } catch (err) {
    next(err)
  }
}

export async function createLane(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createLaneSchema.parse(req.body)
    const lane = await laneService.createLane({
      originPortId: body.originPortId,
      destPortId: body.destPortId,
      carrierId: body.carrierId,
      mode: body.mode,
      productType: body.productType,
      tempMin: body.tempMin,
      tempMax: body.tempMax,
      userId: req.user!.id,
    })
    res.status(201).json(lane)
  } catch (err) {
    next(err)
  }
}

export async function deleteLane(req: Request, res: Response, next: NextFunction) {
  try {
    const id = uuidParam.parse(req.params.id)
    await laneService.removeLane(id, req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
