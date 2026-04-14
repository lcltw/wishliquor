"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified")
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (isLogin) {
      // Login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Redirect based on user type
        if (email === "heroliquor@outlook.com") {
          router.push("/admin")
        } else {
          router.push("/design")
        }
      }
    } else {
      // Register
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          setLoading(false)
        } else {
          setVerificationSent(true)
          setLoading(false)
        }
      } catch {
        setError("Registration failed")
        setLoading(false)
      }
    }
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-gray-600 mb-4">
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Click the link in your email to activate your account.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-xs text-yellow-700">
                <strong>Development Mode:</strong> Check the terminal/console for the verification link.
              </p>
            </div>
            <button
              onClick={() => setVerificationSent(false)}
              className="text-blue-600 hover:underline"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <img
            src="/Logo.png"
            alt="logo"
            className="h-16 mx-auto mb-4 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h1 className="text-2xl font-bold">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? "Sign in to manage your store" : "Create an account to get started"}
          </p>
        </div>

        {verified && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            ✓ Email verified! You can now sign in.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error === "Configuration" ? (
              <>
                <strong>Server Configuration Error</strong>
                <p className="text-sm mt-1">
                  This is usually caused by NEXTAUTH_URL being set to "localhost" in production.
                  Please contact the administrator to fix the server configuration.
                </p>
              </>
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              required
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters with uppercase, lowercase and numbers
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-amber-600 hover:underline ml-1"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Admin Quick Login */}
        {isLogin && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center mb-2">Admin Quick Login</p>
            <button
              onClick={() => {
                setEmail("heroliquor@outlook.com")
                setPassword("Clw097890258")
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Fill Admin Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
