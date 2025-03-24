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
    // Set authentication cookie
    cookies().set({
      name: "auth-token",
      value: "authenticated", // In a real app, use a JWT or other secure token
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      // Set expiry to 24 hours
      maxAge: 60 * 60 * 24,
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

// Add a logout function to clear the auth cookie
export async function logout() {
  cookies().delete("auth-token")

  return {
    success: true,
  }
}

