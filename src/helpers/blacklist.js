const path = require("path");
const fs = require("fs").promises;

const blacklistFile = path.join(__dirname, "blacklist.json");

async function addToBlacklist(authorId) {
  try {
    let blacklistJson = {};
    try {
      const blacklistData = await fs.readFile(blacklistFile, "utf8");
      blacklistJson = JSON.parse(blacklistData);
    } catch (readError) {
      // Skip since we will create the object.
    }

    blacklistJson[authorId] = true;

    await fs.writeFile(blacklistFile, JSON.stringify(blacklistJson, null, 2));

    console.log(`Added ${authorId} to blacklist.`);
  } catch (error) {
    console.error("Error adding to blacklist:", error);
  }
}

async function isBlacklisted(authorId) {
  try {
    let blacklistJson = {};
    try {
      const blacklistData = await fs.readFile(blacklistFile, "utf8");
      blacklistJson = JSON.parse(blacklistData);
    } catch (readError) {
      // If the file doesn't exist, return false
      return false;
    }

    // Check if authorId exists in blacklist
    return blacklistJson[authorId] == true;
  } catch (error) {
    console.error("Error checking blacklist:", error);
    return false;
  }
}

module.exports = { addToBlacklist, isBlacklisted };
