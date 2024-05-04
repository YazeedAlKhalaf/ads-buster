const { getStore } = require("../store.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;

const adminListFile = path.join(__dirname, "adminlist.json");

const Admin = mongoose.model("Admin", { id: String });

async function addToAdminList(adminId) {
  try {
    if (getStore()) {
      const admin = new Admin({ id: adminId });
      await admin.save();
    } else {
      let adminListJson = {};
      try {
        const adminListData = await fs.readFile(adminListFile, "utf8");
        adminListJson = JSON.parse(adminListData);
      } catch (readError) {
        // Skip since we will create the object.
      }

      adminListJson[adminId] = true;

      await fs.writeFile(adminListFile, JSON.stringify(adminListJson, null, 2));
    }

    console.log(`👑 Added ${adminId} to admin list.`);
  } catch (error) {
    console.error("Error adding to admin list:", error);
  }
}

async function isAdmin(adminId) {
  try {
    if (getStore()) {
      const doesAdminExist = await Admin.exists({ id: adminId });
      return doesAdminExist;
    }

    let adminListJson = {};
    try {
      const adminListData = await fs.readFile(adminListFile, "utf8");
      adminListJson = JSON.parse(adminListData);
    } catch (readError) {
      return false;
    }

    return adminListJson[adminId] == true;
  } catch (error) {
    console.error("Error checking admin list:", error);
    return false;
  }
}

module.exports = { addToAdminList, isAdmin };
