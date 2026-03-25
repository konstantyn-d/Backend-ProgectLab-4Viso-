import { Router } from 'express'
import * as ctrl from '../controllers/audit.controller'

const router = Router()

router.get('/', ctrl.getEvents)
router.get('/export', ctrl.exportEvents)

export default router
