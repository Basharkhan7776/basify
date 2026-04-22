import mongoose from "mongoose"

import { env } from "@/lib/env"

declare global {
  var __basifyMongoosePromise: Promise<typeof mongoose> | undefined
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose
  }

  if (!global.__basifyMongoosePromise) {
    global.__basifyMongoosePromise = mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
    })
  }

  return global.__basifyMongoosePromise
}
