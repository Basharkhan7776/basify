import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const userProfileSchema = new Schema(
  {
    authUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    username: { type: String, required: true },
    image: { type: String },
    reputation: { type: Number, default: 78 },
    totalEarnings: { type: Number, default: 0 },
    poolsJoined: { type: Number, default: 0 },
    primaryWalletAddress: { type: String, default: null, index: true },
    oauthProvider: { type: String, default: "oauth" },
    roles: { type: [String], default: ["member", "pool-maker"] },
  },
  { timestamps: true }
)

export type UserProfileDocument = InferSchemaType<typeof userProfileSchema>

export const UserProfileModel: Model<UserProfileDocument> =
  models.UserProfile ?? model("UserProfile", userProfileSchema)
