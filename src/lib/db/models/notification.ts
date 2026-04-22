import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const notificationSchema = new Schema(
  {
    authUserId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    readAt: { type: Date, default: null },
    kind: { type: String, required: true, default: "system" },
  },
  { timestamps: true }
)

export type NotificationDocument = InferSchemaType<typeof notificationSchema>

export const NotificationModel: Model<NotificationDocument> =
  models.Notification ?? model("Notification", notificationSchema)
