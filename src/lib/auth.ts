import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"

import { env, isOAuthProviderEnabled } from "@/lib/env"
import { getMongoDb } from "@/lib/mongodb"

const socialProviders = {
  ...(isOAuthProviderEnabled("google")
    ? {
        google: {
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
        },
      }
    : {}),
  ...(isOAuthProviderEnabled("github")
    ? {
        github: {
          clientId: env.githubClientId,
          clientSecret: env.githubClientSecret,
        },
      }
    : {}),
}

async function createAuth() {
  const db = await getMongoDb()

  return betterAuth({
    appName: "Basify",
    baseURL: env.appUrl,
    secret: env.authSecret,
    database: mongodbAdapter(db, {
      transaction: false,
    }),
    socialProviders,
    plugins: [nextCookies()],
    trustedOrigins: [env.appUrl],
  })
}

declare global {
  var __basifyAuthPromise:
    | Promise<Awaited<ReturnType<typeof createAuth>>>
    | undefined
}

export function getAuth() {
  if (!global.__basifyAuthPromise) {
    global.__basifyAuthPromise = createAuth()
  }

  return global.__basifyAuthPromise!
}
