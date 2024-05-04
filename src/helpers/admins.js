const path = require("path");
const fs = require("fs").promises;

const adminListFile = path.join(__dirname, "adminlist.json");

async function addToAdminList(adminId) {
  try {
    let adminListJson = {};
    try {
      const adminListData = await fs.readFile(adminListFile, "utf8");
      adminListJson = JSON.parse(adminListData);
    } catch (readError) {
      // Skip since we will create the object.
    }

    adminListJson[adminId] = true;

    await fs.writeFile(adminListFile, JSON.stringify(adminListJson, null, 2));

    console.log(`Added ${adminId} to admin list.`);
  } catch (error) {
    console.error("Error adding to admin list:", error);
  }
}

async function isAdmin(adminId) {
  try {
    let adminListJson = {};
    try {
      const adminListData = await fs.readFile(adminListFile, "utf8");
      adminListJson = JSON.parse(adminListData);
    } catch (readError) {
      // If the file doesn't exist, return false
      return false;
    }

    // Check if adminId exists in admin list
    return adminListJson[adminId] == true;
  } catch (error) {
    console.error("Error checking admin list:", error);
    return false;
  }
}

module.exports = { addToAdminList, isAdmin };
