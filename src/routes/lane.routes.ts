import { Router } from 'express'
import * as laneCtrl from '../controllers/lane.controller'
import * as tempCtrl from '../controllers/temperature.controller'

const router = Router()

router.get('/', laneCtrl.getLanes)
router.get('/:id', laneCtrl.getLaneById)
router.post('/', laneCtrl.createLane)
router.delete('/:id', laneCtrl.deleteLane)

router.get('/:id/temperature', tempCtrl.getReadings)
router.post('/:id/temperature', tempCtrl.createReading)

export default router
