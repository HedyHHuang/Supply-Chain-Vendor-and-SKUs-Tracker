import express from "express";
import { getDatabase } from "../db/mongo.js";

const router = express.Router();

// Read all vendors
router.get("/", async (request, response) => {
  try {
    const database = getDatabase();
    const vendors = await database.collection("vendors").find({}).toArray();

    response.json(vendors);
  } catch (error) {
    console.error("Unable to get vendors:", error);

    response.status(500).json({
      message: "Unable to get vendors.",
    });
  }
});

// Create a new vendor
router.post("/", async (request, response) => {
  try {
    const database = getDatabase();

    const newVendor = {
      id: `vendor-${Date.now()}`,
      ...request.body,
    };

    await database.collection("vendors").insertOne(newVendor);

    response.status(201).json(newVendor);
  } catch (error) {
    console.error("Unable to create vendor:", error);

    response.status(500).json({
      message: "Unable to create vendor.",
    });
  }
});

// Update an existing vendor
router.put("/:id", async (request, response) => {
  try {
    const database = getDatabase();

    const existingVendor = await database.collection("vendors").findOne({
      id: request.params.id,
    });

    if (!existingVendor) {
      response.status(404).json({
        message: "Vendor not found.",
      });

      return;
    }

    const updatedVendor = {
      ...existingVendor,
      ...request.body,
      id: existingVendor.id,
    };

    delete updatedVendor._id;

    await database.collection("vendors").updateOne(
      {
        id: request.params.id,
      },
      {
        $set: updatedVendor,
      },
    );

    response.json({
      ...updatedVendor,
      _id: existingVendor._id,
    });
  } catch (error) {
    console.error("Unable to update vendor:", error);

    response.status(500).json({
      message: "Unable to update vendor.",
    });
  }
});

// Delete a vendor
router.delete("/:id", async (request, response) => {
  try {
    const database = getDatabase();

    const vendorToDelete = await database.collection("vendors").findOne({
      id: request.params.id,
    });

    if (!vendorToDelete) {
      response.status(404).json({
        message: "Vendor not found.",
      });

      return;
    }

    await database.collection("vendors").deleteOne({
      id: request.params.id,
    });

    response.json(vendorToDelete);
  } catch (error) {
    console.error("Unable to delete vendor:", error);

    response.status(500).json({
      message: "Unable to delete vendor.",
    });
  }
});

export default router;
