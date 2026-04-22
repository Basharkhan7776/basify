import { InferSchemaType, Model, Schema, model, models } from "mongoose"

const schedulerJobSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, default: "pending" },
    payload: { type: Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
)

export type SchedulerJobDocument = InferSchemaType<typeof schedulerJobSchema>

export const SchedulerJobModel: Model<SchedulerJobDocument> =
  models.SchedulerJob ?? model("SchedulerJob", schedulerJobSchema)
