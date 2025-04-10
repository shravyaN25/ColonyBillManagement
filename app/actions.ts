"use server"

import { cookies } from "next/headers"

// This server action reads credentials from environment variables
export async function login(username: string, password: string) {
  // Get credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  // Simple validation
  if (!adminUsername || !adminPassword) {
    return {
      success: false,
      error: "Admin credentials not configured in environment variables",
    }
  }

  // Check if credentials match
  if (username === adminUsername && password === adminPassword) {
    // Create a simple token (in production, use a proper JWT)
    const token = Buffer.from(JSON.stringify({
      id: "admin-user",
      username,
      role: "admin",
      exp: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
    })).toString("base64")
    
    // Set the auth cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax"
    })
    
    return {
      success: true,
    }
  }

  // Return error if credentials don't match
  return {
    success: false,
    error: "Invalid username or password",
  }
}

// Add a logout function
export async function logout() {
  cookies().delete("auth-token")
  return { success: true }
}

// Add a function to check if user is authenticated
export async function checkAuth() {
  const token = cookies().get("auth-token")?.value
  
  if (!token) {
    return { authenticated: false }
  }
  
  try {
    // Decode and verify the token
    const userData = JSON.parse(Buffer.from(token, "base64").toString())
    
    // Check if token is expired
    if (userData.exp < Date.now()) {
      cookies().delete("auth-token")
      return { authenticated: false }
    }
    
    return { 
      authenticated: true,
      user: {
        id: userData.id,
        username: userData.username,
        role: userData.role
      }
    }
  } catch (error) {
    cookies().delete("auth-token")
    return { authenticated: false }
  }
}

// Add a function to get the current user (if authenticated)
export async function getCurrentUser() {
  const { authenticated, user } = await checkAuth()
  
  if (!authenticated) {
    return null
  }
  
  return user
}

