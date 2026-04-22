export const env = {
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000",
  authSecret:
    process.env.BETTER_AUTH_SECRET ??
    "development-secret-change-this-before-production",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/basify",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "basify",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  gmailUser: process.env.GMAIL_SMTP_USER ?? "",
  gmailAppPassword: process.env.GMAIL_SMTP_APP_PASSWORD ?? "",
  schedulerSecret: process.env.SCHEDULER_SECRET ?? "development-scheduler-secret",
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
  sepoliaRpcUrl:
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
    process.env.SEPOLIA_RPC_URL ??
    "https://ethereum-sepolia-rpc.publicnode.com",
  walletOperatorKey:
    process.env.SEPOLIA_OPERATOR_PRIVATE_KEY ??
    process.env.PRIVET_KEY ??
    "",
  factoryAddress:
    process.env.NEXT_PUBLIC_FACTORY_ADDRESS ??
    process.env.FACTORY_ADDRESS ??
    "",
  tokenAddress:
    process.env.NEXT_PUBLIC_POOL_TOKEN_ADDRESS ??
    process.env.POOL_TOKEN_ADDRESS ??
    "",
  cronMonthDurationHours: Number(process.env.MONTH_DURATION_HOURS ?? "1"),
  reviewerEmails: (process.env.REVIEWER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
}

export function isOAuthProviderEnabled(provider: "google" | "github") {
  if (provider === "google") {
    return Boolean(env.googleClientId && env.googleClientSecret)
  }

  return Boolean(env.githubClientId && env.githubClientSecret)
}

export function hasMailerConfig() {
  return Boolean(env.gmailUser && env.gmailAppPassword)
}

export function hasMongoConfig() {
  return Boolean(env.mongoUri)
}

export function hasGeminiConfig() {
  return Boolean(env.geminiApiKey)
}
