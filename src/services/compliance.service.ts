import * as complianceRepo from '../repositories/compliance.repository'
import * as laneRepo from '../repositories/lane.repository'
import * as auditService from './audit.service'

interface CreateComplianceInput {
  laneId: string
  score: number
  gdpStatus: boolean
  notes?: string
  openIssues: number
  userId: string
}

export async function createRecord(input: CreateComplianceInput) {
  const record = await complianceRepo.createRecord({
    lane_id: input.laneId,
    score: input.score,
    gdp_status: input.gdpStatus,
    audited_by: input.userId,
    open_issues: input.openIssues,
    notes: input.notes,
  })

  await laneRepo.updateLane(input.laneId, { gdp_compliant: input.gdpStatus })

  await auditService.logEvent({
    type: 'compliance_check',
    severity: input.gdpStatus ? 'success' : 'warning',
    title: `Compliance check: score ${input.score}%`,
    description: `GDP status: ${input.gdpStatus ? 'compliant' : 'non-compliant'}`,
    laneId: input.laneId,
    userId: input.userId,
  })

  return record
}
