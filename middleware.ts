import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - require admin access
    if (path.startsWith("/admin")) {
      if (!token || token.email !== "heroliquor@outlook.com") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // Design routes - require login
    if (path.startsWith("/design")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Admin routes need admin token
        if (path.startsWith("/admin")) {
          return token !== null && token.email === "heroliquor@outlook.com"
        }
        
        // Design routes need any valid token
        if (path.startsWith("/design")) {
          return token !== null
        }
        
        return true
      }
    }
  }
)

export const config = {
  matcher: ["/design/:path*", "/admin/:path*"]
}
