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
        const validatedFields = LoginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const userRecord = await db.query.users.findFirst({
          where: eq(users.email, email),
        })

        if (!userRecord || !userRecord.password) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          userRecord.password
        )

        if (!passwordsMatch) return null

        return userRecord
      },
    }),
  ],
})
