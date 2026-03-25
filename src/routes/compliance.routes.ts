import { Router } from 'express'
import * as ctrl from '../controllers/compliance.controller'

const router = Router()

router.get('/', ctrl.getRecords)
router.get('/export', ctrl.exportRecords)
router.post('/', ctrl.createRecord)

export default router
