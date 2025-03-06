import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend global type to avoid TypeScript issues
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Use global object to prevent multiple connections in development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Create a new connection for production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
