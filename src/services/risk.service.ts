const productSensitivity: Record<string, number> = {
  vaccines: 20,
  biologics: 15,
  api: 10,
  other: 5,
}

export function calculateRiskScore(factors: {
  temperatureDeviations: number
  carrierGdpCertified: boolean
  productType: string
  routeDistance: number
  currentDeviation: boolean
}): number {
  let score = 0

  score += Math.min(factors.temperatureDeviations * 8, 40)

  if (!factors.carrierGdpCertified) score += 20

  score += productSensitivity[factors.productType] ?? 5

  score += Math.min(Math.floor(factors.routeDistance / 1000), 10)

  if (factors.currentDeviation) score += 10

  return Math.min(score, 100)
}
