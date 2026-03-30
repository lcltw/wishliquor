import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

interface User {
  id: string
  email: string
  password: string
  name: string
  isAdmin: boolean
  isVerified: boolean
}

// Simple in-memory user store (in production, use a database)
const users: User[] = [
  {
    id: "1",
    email: "heroliquor@outlook.com",
    password: bcrypt.hashSync("Clw097890258", 10),
    name: "Admin",
    isAdmin: true,
    isVerified: true
  }
]

// Verification tokens store
const verificationTokens: { [key: string]: { email: string; expires: Date } } = {}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compareSync(password, hash)
}

export function generateVerificationToken(email: string): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  verificationTokens[token] = {
    email,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
  console.log(`[EMAIL VERIFICATION] Token for ${email}: ${token}`)
  return token
}

export function verifyToken(token: string): string | null {
  const data = verificationTokens[token]
  if (!data) return null
  if (data.expires < new Date()) {
    delete verificationTokens[token]
    return null
  }
  return data.email
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function createUser(email: string, password: string, name: string): User {
  const hashedPassword = bcrypt.hashSync(password, 10)
  const newUser: User = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    isAdmin: email === "heroliquor@outlook.com",
    isVerified: false
  }
  users.push(newUser)
  return newUser
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password")
        }

        const user = getUserByEmail(credentials.email)
        
        if (!user) {
          throw new Error("User not found")
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first")
        }

        const isValid = verifyPassword(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        const dbUser = getUserByEmail(user.email || "")
        token.isAdmin = dbUser?.isAdmin || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || "wishliquor-secret-key-change-in-production"
}
