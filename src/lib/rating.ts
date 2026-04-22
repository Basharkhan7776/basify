export function paymentFailureProbability(reputation: number) {
  const bounded = Math.max(0, Math.min(100, reputation))
  return Math.max(0.05, Math.min(0.65, 0.68 - bounded / 100))
}

export function simulateAutoPayOutcome(reputation: number, seed: string) {
  const probability = paymentFailureProbability(reputation)
  const normalizedSeed = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const score = (normalizedSeed % 100) / 100

  return {
    failed: score < probability,
    failureProbability: probability,
  }
}
