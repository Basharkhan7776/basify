import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const poolMemberSchema = new Schema(
  {
    poolSlug: { type: String, required: true, index: true },
    authUserId: { type: String, required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    reputation: { type: Number, required: true, default: 75 },
    contributionStatus: { type: String, required: true, default: "Pending" },
    roundsReceived: { type: Number, required: true, default: 0 },
    payoutReceived: { type: Boolean, required: true, default: false },
    enrollmentStatus: { type: String, required: true, default: "Approved" },
    autoPayEnabled: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

poolMemberSchema.index({ poolSlug: 1, authUserId: 1 }, { unique: true })

export type PoolMemberDocument = InferSchemaType<typeof poolMemberSchema>

export const PoolMemberModel: Model<PoolMemberDocument> =
  models.PoolMember ?? model("PoolMember", poolMemberSchema)
