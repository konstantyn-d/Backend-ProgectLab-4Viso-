import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getAllPorts } from '../repositories/port.repository'
import { getAllCarriers } from '../repositories/carrier.repository'
import dashboardRoutes from './dashboard.routes'
import laneRoutes from './lane.routes'
import shipmentRoutes from './shipment.routes'
import complianceRoutes from './compliance.routes'
import auditRoutes from './audit.routes'

const router = Router()

router.use(authMiddleware)

router.use('/dashboard', dashboardRoutes)
router.use('/lanes', laneRoutes)
router.use('/shipments', shipmentRoutes)
router.use('/compliance', complianceRoutes)
router.use('/audit', auditRoutes)

router.get('/ports', async (_req, res, next) => {
  try {
    const ports = await getAllPorts()
    res.json(ports)
  } catch (err) {
    next(err)
  }
})

router.get('/carriers', async (_req, res, next) => {
  try {
    const carriers = await getAllCarriers()
    res.json(carriers)
  } catch (err) {
    next(err)
  }
})

export default router
