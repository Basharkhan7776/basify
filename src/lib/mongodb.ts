import { Db, MongoClient } from "mongodb"

import { env } from "@/lib/env"

declare global {
  var __basifyMongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise() {
  const client = new MongoClient(env.mongoUri)
  return client.connect()
}

export function getMongoClient() {
  if (!global.__basifyMongoClientPromise) {
    global.__basifyMongoClientPromise = createClientPromise()
  }

  return global.__basifyMongoClientPromise
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient()
  return client.db(env.mongoDbName)
}
