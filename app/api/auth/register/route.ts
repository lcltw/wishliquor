import { NextResponse } from "next/server"
import { getUserByEmail, createUser, generateVerificationToken, getBaseUrl } from "@/auth"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Password validation (at least 8 characters, mix of upper/lower case and numbers)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with uppercase, lowercase and numbers" },
        { status: 400 }
      )
    }

    // Check if user exists
    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Create user
    const user = createUser(email, password, name)

    // Generate verification token
    const token = generateVerificationToken(email)
    const baseUrl = getBaseUrl()

    // In production, you would send an email here
    // For now, we log the verification link
    console.log(`
========================================
📧 EMAIL VERIFICATION
========================================
To: ${email}
Verification Link: ${baseUrl}/api/auth/verify?token=${token}
========================================
    `)

    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      verificationToken: token, // Only for development/testing
      verificationLink: `${baseUrl}/api/auth/verify?token=${token}`
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
