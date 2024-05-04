const { RemoteAuth } = require("whatsapp-web.js");
const { LocalAuth } = require("whatsapp-web.js");
const { getStore } = require("./store");

let authStrategy;

async function initializeAuthStrategy() {
  try {
    const store = getStore();

    if (store) {
      authStrategy = new RemoteAuth({
        store,
        clientId: "ads-buster",
        backupSyncIntervalMs: 60 * 1000,
      });
    } else {
      authStrategy = new LocalAuth({
        clientId: "ads-buster",
      });
    }
  } catch (error) {
    console.error(`❌ Got error initializing authentication strategy: `, error);
  }
}

function getAuthStrategy() {
  return authStrategy;
}

module.exports = { initializeAuthStrategy, getAuthStrategy };
