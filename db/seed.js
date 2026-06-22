import "dotenv/config";
import { connectToDatabase } from "./mongo.js";

const vendors = [
  {
    id: "vendor-001",
    vendorName: "Pacific Food Supply",
    contactPerson: "Amy Lee",
    email: "amy@example.com",
    phone: "510-555-1000",
    website: "https://example.com",
    productCategories: "Frozen Fruit and Puree",
    rating: 3,
    deliveryPerformance: "Some delays during peak season",
    notes: "Competitive pricing for large-volume orders.",
    associatedSkus: ["SKU-001", "SKU-003"],
  },
  {
    id: "vendor-002",
    vendorName: "Golden Produce",
    contactPerson: "Daniel Chen",
    email: "daniel@example.com",
    phone: "408-555-2000",
    website: "https://example.com",
    productCategories: "Fresh and Frozen Produce",
    rating: 4,
    deliveryPerformance: "Usually delivers on time",
    notes: "Strong selection of seasonal products.",
    associatedSkus: ["SKU-001", "SKU-002"],
  },
];

const initialItems = [
  {
    id: "item-001",
    sku: "SKU-001",
    itemName: "Frozen Mango Chunks",
    category: "Frozen Fruit",
    unit: "30 lb case",
    description: "IQF mango chunks for beverage and dessert applications.",
    notes: "Keep frozen and confirm crop origin before ordering.",
    associatedVendors: ["Pacific Food Supply", "Golden Produce"],
  },
  {
    id: "item-002",
    sku: "SKU-002",
    itemName: "Strawberry Puree",
    category: "Fruit Puree",
    unit: "5 kg case",
    description: "Strawberry puree for beverage and bakery applications.",
    notes: "Check sugar content and shelf life before purchase.",
    associatedVendors: ["Golden Produce"],
  },
];

const categories = [
  "Frozen Fruit",
  "Fruit Puree",
  "Dairy",
  "Tea",
  "Packaging",
  "Sweetener",
];

const units = [
  "10 lb case",
  "20 lb case",
  "30 lb case",
  "5 kg case",
  "12 bottles",
  "24 units",
];

const generatedItems = Array.from(
  {
    length: 1000,
  },
  (_, index) => {
    const itemNumber = index + 3;
    const paddedNumber = String(itemNumber).padStart(4, "0");

    return {
      id: `item-${paddedNumber}`,
      sku: `SKU-${paddedNumber}`,
      itemName: `Sample Supply Chain Item ${itemNumber}`,
      category: categories[index % categories.length],
      unit: units[index % units.length],
      description: `Sample product record ${itemNumber} created for database testing.`,
      notes: "Generated sample record for the project database.",
      associatedVendors:
        index % 2 === 0 ? ["Pacific Food Supply"] : ["Golden Produce"],
    };
  },
);

const items = [...initialItems, ...generatedItems];

async function seedDatabase() {
  try {
    const database = await connectToDatabase();

    const vendorCollection = database.collection("vendors");
    const itemCollection = database.collection("items");

    await vendorCollection.deleteMany({});
    await itemCollection.deleteMany({});

    await vendorCollection.insertMany(vendors);
    await itemCollection.insertMany(items);

    console.log(`${vendors.length} vendors added.`);
    console.log(`${items.length} items added.`);
    console.log(`${vendors.length + items.length} total records added.`);

    process.exit(0);
  } catch (error) {
    console.error("Unable to seed database:", error);
    process.exit(1);
  }
}

seedDatabase();
