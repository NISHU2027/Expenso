import { MongoClient } from 'mongodb';

const client = new MongoClient("mongodb+srv://alokgiri1926_db_user:mGGijnS35BNLrKHR@cluster0.xu6bfhv.mongodb.net/Expenso");

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}