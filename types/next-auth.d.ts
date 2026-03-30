import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      isAdmin?: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    isAdmin?: boolean
    isVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    isAdmin?: boolean
  }
}
