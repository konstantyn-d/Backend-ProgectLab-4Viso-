import { Request, Response, NextFunction } from 'express'
import * as shipmentRepo from '../repositories/shipment.repository'
import { paginationQuery, uuidParam } from '../validators/common'
import { AppError } from '../middleware/errorHandler'
import { z } from 'zod'

const shipmentsQuery = paginationQuery.extend({
  laneId: z.string().uuid().optional(),
  status: z.enum(['active', 'in_transit', 'delivered', 'delayed']).optional(),
})

export async function getShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const query = shipmentsQuery.parse(req.query)
    const result = await shipmentRepo.getShipments({
      laneId: query.laneId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })
    res.json({ data: result.data, total: result.total, page: query.page })
  } catch (err) {
    next(err)
  }
}

export async function getShipmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = uuidParam.parse(req.params.id)
    const shipment = await shipmentRepo.getShipmentById(id)
    if (!shipment) throw new AppError(404, 'NOT_FOUND', 'Shipment not found')
    res.json(shipment)
  } catch (err) {
    next(err)
  }
}
