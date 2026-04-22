import nodemailer from "nodemailer"

import { env, hasMailerConfig } from "@/lib/env"

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailUser,
      pass: env.gmailAppPassword,
    },
  })
}

export async function sendProtocolEmail(input: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  if (!hasMailerConfig()) {
    return { skipped: true }
  }

  const transport = getTransport()
  await transport.sendMail({
    from: `"Basify Protocol" <${env.gmailUser}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  })

  return { skipped: false }
}
