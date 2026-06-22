import "dotenv/config";
import express from "express";
import { connectToDatabase } from "./db/mongo.js";
import vendorRouter from "./routes/vendors.js";
import itemRouter from "./routes/items.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api/vendors", vendorRouter);
app.use("/api/items", itemRouter);

async function startServer() {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
