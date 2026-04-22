import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const poolRoundSchema = new Schema(
  {
    poolSlug: { type: String, required: true, index: true },
    roundNumber: { type: Number, required: true },
    status: { type: String, required: true, default: "Open" },
    contributionWindowStartsAt: { type: Date, default: null },
    contributionWindowEndsAt: { type: Date, default: null },
    biddingWindowEndsAt: { type: Date, default: null },
    winnerName: { type: String, default: "Pending" },
    winnerWallet: { type: String, default: "" },
    lowestBid: { type: Number, default: 0 },
    settlementSummary: { type: String, default: "" },
  },
  { timestamps: true }
)

poolRoundSchema.index({ poolSlug: 1, roundNumber: 1 }, { unique: true })

export type PoolRoundDocument = InferSchemaType<typeof poolRoundSchema>

export const PoolRoundModel: Model<PoolRoundDocument> =
  models.PoolRound ?? model("PoolRound", poolRoundSchema)
