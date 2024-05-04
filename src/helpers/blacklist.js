const { getStore } = require("../store.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;

const blacklistFile = path.join(__dirname, "blacklist.json");

const BlacklistedUser = mongoose.model("BlacklistedUser", {
  id: String,
  doerId: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

/**
 *
 * @param {string} authorId
 * @param {string} doerId
 * @param {string} reason
 */
async function addToBlacklist(authorId, doerId, reason) {
  try {
    if (getStore()) {
      const doesBlacklistedUserExist = await BlacklistedUser.exists({
        id: authorId,
      });
      if (!doesBlacklistedUserExist) {
        const blacklistedUser = new BlacklistedUser({
          id: authorId,
          doerId: doerId,
          reason: reason,
        });
        await blacklistedUser.save();
        console.log(`Added ${authorId} to blacklist.`);
      } else {
        console.log(`User ${authorId} is already blacklisted.`);
      }
    } else {
      let blacklistJson = {};
      try {
        const blacklistData = await fs.readFile(blacklistFile, "utf8");
        blacklistJson = JSON.parse(blacklistData);
      } catch (readError) {
        // Skip since we will create the object.
      }

      blacklistJson[authorId] = true;

      await fs.writeFile(blacklistFile, JSON.stringify(blacklistJson, null, 2));
    }

    console.log(`Added ${authorId} to blacklist.`);
  } catch (error) {
    console.error("Error adding to blacklist:", error);
  }
}

async function isBlacklisted(authorId) {
  try {
    if (getStore()) {
      const doesBlacklistedUserExist = await BlacklistedUser.exists({
        id: authorId,
      });
      return doesBlacklistedUserExist;
    }

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
