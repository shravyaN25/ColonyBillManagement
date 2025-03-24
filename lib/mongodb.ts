import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not defined")
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
console.log("MongoDB URI:", uri.substring(0, 15) + "..." + uri.substring(uri.lastIndexOf("@")))

const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log("Creating new MongoDB client (development)")
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("Failed to connect to MongoDB (development):", err)
      throw err
    })
  } else {
    console.log("Using existing MongoDB client (development)")
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  console.log("Creating new MongoDB client (production)")
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((err) => {
    console.error("Failed to connect to MongoDB (production):", err)
    throw err
  })
}

// Add a wrapper to test the connection
export async function testMongoConnection() {
  try {
    console.log("Testing MongoDB connection...")
    const client = await clientPromise
    const adminDb = client.db().admin()
    const result = await adminDb.ping()
    console.log("MongoDB connection test result:", result)
    return { success: true, result }
  } catch (error) {
    console.error("MongoDB connection test failed:", error)
    return { success: false, error: error.message }
  }
}

export default clientPromise

