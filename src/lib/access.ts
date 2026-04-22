import { env } from "@/lib/env"

export function getDefaultRoles(email?: string | null) {
  const roles = new Set<string>(["member", "pool-maker"])

  if (email && env.reviewerEmails.includes(email.toLowerCase())) {
    roles.add("reviewer")
  }

  return [...roles]
}

export function hasRole(roles: string[] | undefined, role: string) {
  return Boolean(roles?.includes(role))
}
