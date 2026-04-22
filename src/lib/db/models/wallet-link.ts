import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const walletLinkSchema = new Schema(
  {
    authUserId: { type: String, required: true, index: true },
    address: { type: String, required: true, unique: true, index: true },
    chainId: { type: Number, required: true, default: 11155111 },
    isPrimary: { type: Boolean, default: true },
    verifiedAt: { type: Date, required: true },
    lastSignedMessage: { type: String, required: true },
  },
  { timestamps: true }
)

export type WalletLinkDocument = InferSchemaType<typeof walletLinkSchema>

export const WalletLinkModel: Model<WalletLinkDocument> =
  models.WalletLink ?? model("WalletLink", walletLinkSchema)
