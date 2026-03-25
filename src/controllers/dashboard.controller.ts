import { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboard.service'

export async function getKPIs(_req: Request, res: Response, next: NextFunction) {
  try {
    const kpis = await dashboardService.getKPIs()
    res.json(kpis)
  } catch (err) {
    next(err)
  }
}

export async function getCorridors(_req: Request, res: Response, next: NextFunction) {
  try {
    const corridors = await dashboardService.getCorridors()
    res.json(corridors)
  } catch (err) {
    next(err)
  }
}
