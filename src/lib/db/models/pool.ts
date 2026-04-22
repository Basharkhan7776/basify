import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const poolSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, required: true, default: "Enrollment" },
    category: { type: String, required: true, default: "Non-Bidding" },
    contributionAmount: { type: Number, required: true },
    memberLimit: { type: Number, required: true },
    membersCount: { type: Number, required: true, default: 0 },
    totalRounds: { type: Number, required: true },
    currentRound: { type: Number, required: true, default: 0 },
    securityDeposit: { type: Number, required: true },
    gracePeriodDurationHours: { type: Number, required: true, default: 1 },
    roundDurationHours: { type: Number, required: true, default: 1 },
    biddingEnabled: { type: Boolean, required: true, default: false },
    lowestBid: { type: Number, required: true, default: 0 },
    settlementSummary: { type: String, default: "" },
    countdownAt: { type: Date, default: null },
    chainId: { type: Number, required: true, default: 11155111 },
    poolAddress: { type: String, default: "" },
    vaultAddress: { type: String, default: "" },
    tokenAddress: { type: String, default: "" },
    creatorUserId: { type: String, required: true, index: true },
    creatorWallet: { type: String, default: "" },
    autopayEnabled: { type: Boolean, default: true },
    reviewStatus: { type: String, required: true, default: "pending" },
    reviewedByUserId: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export type PoolDocument = InferSchemaType<typeof poolSchema>

export const PoolModel: Model<PoolDocument> =
  models.Pool ?? model("Pool", poolSchema)
