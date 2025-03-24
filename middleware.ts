import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Define which paths are protected (require authentication)
  const isProtectedPath = path.startsWith("/dashboard")

  // Check if the user is authenticated by looking for the auth cookie
  const isAuthenticated = request.cookies.has("auth-token")

  // If trying to access a protected route without authentication, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    // Create a URL for the login page and maintain the original URL as a query parameter
    // so we can redirect back after login
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("callbackUrl", path)

    return NextResponse.redirect(loginUrl)
  }

  // If trying to access login page while already authenticated, redirect to dashboard
  if (path === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/dashboard/:path*"],
}

