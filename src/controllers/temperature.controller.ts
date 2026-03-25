import { Request, Response, NextFunction } from 'express'
import * as tempRepo from '../repositories/temperature.repository'
import * as tempService from '../services/temperature.service'
import { uuidParam } from '../validators/common'
import { createTemperatureSchema, temperatureQuerySchema } from '../validators/temperature.validator'

export async function getReadings(req: Request, res: Response, next: NextFunction) {
  try {
    const laneId = uuidParam.parse(req.params.id)
    const query = temperatureQuerySchema.parse(req.query)
    const readings = await tempRepo.getReadings(laneId, query.from, query.to)
    const deviations = readings.filter((r) => r.is_deviation).length
    res.json({ readings, deviations })
  } catch (err) {
    next(err)
  }
}

export async function createReading(req: Request, res: Response, next: NextFunction) {
  try {
    const laneId = uuidParam.parse(req.params.id)
    const body = createTemperatureSchema.parse(req.body)
    const reading = await tempService.recordTemperature(
      laneId,
      body.value,
      req.user!.id,
      body.recordedAt,
    )
    res.status(201).json(reading)
  } catch (err) {
    next(err)
  }
}
