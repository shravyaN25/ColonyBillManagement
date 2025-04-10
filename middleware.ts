import { NextRequest, NextResponse } from "next/server"

// Define protected routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/', '/login', '/unauthorized']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`))
  
  // Get the authentication token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  // If trying to access a protected route without a token, redirect to unauthorized page
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  // If already logged in and trying to access login page, redirect to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Configure which routes middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, and other static assets
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
