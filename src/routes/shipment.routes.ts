import { Router } from 'express'
import * as ctrl from '../controllers/shipment.controller'

const router = Router()

router.get('/', ctrl.getShipments)
router.get('/:id', ctrl.getShipmentById)

export default router
