import express from "express";
import { getDatabase } from "../db/mongo.js";

const router = express.Router();

// Read all items
router.get("/", async (request, response) => {
  try {
    const database = getDatabase();
    const items = await database.collection("items").find({}).toArray();

    response.json(items);
  } catch (error) {
    console.error("Unable to get items:", error);

    response.status(500).json({
      message: "Unable to get items.",
    });
  }
});

// Create a new item
router.post("/", async (request, response) => {
  try {
    const database = getDatabase();

    const newItem = {
      id: `item-${Date.now()}`,
      ...request.body,
    };

    await database.collection("items").insertOne(newItem);

    response.status(201).json(newItem);
  } catch (error) {
    console.error("Unable to create item:", error);

    response.status(500).json({
      message: "Unable to create item.",
    });
  }
});

// Update an existing item
router.put("/:id", async (request, response) => {
  try {
    const database = getDatabase();

    const existingItem = await database.collection("items").findOne({
      id: request.params.id,
    });

    if (!existingItem) {
      response.status(404).json({
        message: "Item not found.",
      });

      return;
    }

    const updatedItem = {
      ...existingItem,
      ...request.body,
      id: existingItem.id,
    };

    delete updatedItem._id;

    await database.collection("items").updateOne(
      {
        id: request.params.id,
      },
      {
        $set: updatedItem,
      },
    );

    response.json({
      ...updatedItem,
      _id: existingItem._id,
    });
  } catch (error) {
    console.error("Unable to update item:", error);

    response.status(500).json({
      message: "Unable to update item.",
    });
  }
});

// Delete an item
router.delete("/:id", async (request, response) => {
  try {
    const database = getDatabase();

    const itemToDelete = await database.collection("items").findOne({
      id: request.params.id,
    });

    if (!itemToDelete) {
      response.status(404).json({
        message: "Item not found.",
      });

      return;
    }

    await database.collection("items").deleteOne({
      id: request.params.id,
    });

    response.json(itemToDelete);
  } catch (error) {
    console.error("Unable to delete item:", error);

    response.status(500).json({
      message: "Unable to delete item.",
    });
  }
});

export default router;
