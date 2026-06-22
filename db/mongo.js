import { MongoClient } from "mongodb";

const mongoUrl = "mongodb://localhost:27017";
const databaseName = "supplyChainTracker";

const client = new MongoClient(mongoUrl);

let database;

export async function connectToDatabase() {
  if (database) {
    return database;
  }

  await client.connect();

  database = client.db(databaseName);

  console.log(`Connected to MongoDB database: ${databaseName}`);

  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error(
      "Database has not been connected. Call connectToDatabase first.",
    );
  }

  return database;
}
