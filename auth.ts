import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "./lib/db"
import { users } from "./lib/db/schema"
import { eq } from "drizzle-orm"
import { authConfig } from "./auth.config"
import { LoginSchema } from "./lib/validations"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("[authorize] credentials keys:", Object.keys(credentials ?? {}))
        const validatedFields = LoginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          console.log("[authorize] validation FAILED:", validatedFields.error.issues)
          return null
        }

        const { email, password } = validatedFields.data
        console.log("[authorize] looking up user:", email)

        const userRecord = await db.query.users.findFirst({
          where: eq(users.email, email),
        })

        if (!userRecord) {
          console.log("[authorize] NO user found for:", email)
          return null
        }
        if (!userRecord.password) {
          console.log("[authorize] user found but has NO password (OAuth-only?):", email)
          return null
        }

        console.log("[authorize] user found, comparing passwords...")
        const passwordsMatch = await bcrypt.compare(
          password,
          userRecord.password
        )
        console.log("[authorize] passwordsMatch:", passwordsMatch)

        if (!passwordsMatch) return null

        // Never expose the password hash in the returned object / token.
        const { password: _pw, ...safeUser } = userRecord
        return safeUser as typeof userRecord
      },
    }),
  ],
})
