import { NextResponse } from "next/server"
import { verifyToken, getUserByEmail } from "@/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 }
    )
  }

  const email = verifyToken(token)

  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 400 }
    )
  }

  // Find and update user
  const user = getUserByEmail(email)
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Update user as verified
  user.isVerified = true

  // Redirect to login page with success message
  return NextResponse.redirect(
    new URL("/login?verified=true", request.url)
  )
}
