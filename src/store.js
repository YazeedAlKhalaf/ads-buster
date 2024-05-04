const mongoose = require("mongoose");
const { MongoStore } = require("wwebjs-mongo");

let store;

async function initializeStore() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to MongoDB successfully!");

      store = new MongoStore({ mongoose });
    }
  } catch (error) {
    console.error(`❌ Got error connecting to MongoDB: `, error);
  }
}

function getStore() {
  return store;
}

module.exports = { initializeStore, getStore };
