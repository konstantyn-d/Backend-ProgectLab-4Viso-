import { Router } from 'express'
import * as ctrl from '../controllers/dashboard.controller'

const router = Router()

router.get('/kpis', ctrl.getKPIs)
router.get('/corridors', ctrl.getCorridors)

export default router
