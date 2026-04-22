import { GoogleGenAI } from "@google/genai"

import { env, hasGeminiConfig } from "@/lib/env"
import { simulateAutoPayOutcome } from "@/lib/rating"

type GeminiDecision = {
  shouldFail: boolean
  confidence: number
  summary: string
}

let cachedGeminiClient: GoogleGenAI | null = null

function getGeminiClient() {
  if (!hasGeminiConfig()) {
    return null
  }

  if (!cachedGeminiClient) {
    cachedGeminiClient = new GoogleGenAI({ apiKey: env.geminiApiKey })
  }

  return cachedGeminiClient
}

export async function evaluatePoolMakerAutopay(input: {
  poolName: string
  poolMakerName: string
  poolMakerRating: number
  contributionAmount: number
  memberCount: number
  currentRound: number
  totalRounds: number
}) {
  const client = getGeminiClient()

  if (!client) {
    const fallback = simulateAutoPayOutcome(
      input.poolMakerRating,
      `${input.poolName}:${input.currentRound}:${input.poolMakerName}`
    )

    return {
      shouldFail: fallback.failed,
      confidence: 0.5,
      summary: "Gemini API key not configured; fallback rating engine used.",
    } satisfies GeminiDecision
  }

  const response = await client.models.generateContent({
    model: env.geminiModel,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Decide whether the scheduled monthly pool submission should fail.",
              "Use the pool maker rating as the main signal of operational reliability.",
              "Higher rating means lower failure risk.",
              "Return only JSON.",
              `Pool: ${input.poolName}`,
              `Pool maker: ${input.poolMakerName}`,
              `Pool maker rating: ${input.poolMakerRating}`,
              `Contribution amount: ${input.contributionAmount}`,
              `Members: ${input.memberCount}`,
              `Current round: ${input.currentRound}`,
              `Total rounds: ${input.totalRounds}`,
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          shouldFail: { type: "boolean" },
          confidence: { type: "number" },
          summary: { type: "string" },
        },
        required: ["shouldFail", "confidence", "summary"],
      },
      temperature: 0.2,
    },
  })

  const parsed = JSON.parse(response.text ?? "{}") as GeminiDecision

  return {
    shouldFail: Boolean(parsed.shouldFail),
    confidence: Number(parsed.confidence ?? 0),
    summary: String(parsed.summary ?? "Gemini did not provide a summary."),
  } satisfies GeminiDecision
}
