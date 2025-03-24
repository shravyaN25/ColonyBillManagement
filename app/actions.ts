"use server"

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

