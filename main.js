const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const { LocalAuth } = require("whatsapp-web.js");

async function main() {
  try {
    let authStrategy;

    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to MongoDB successfully!");

      const store = new MongoStore({ mongoose });

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

    const client = new Client({
      authStrategy: authStrategy,
      webVersion: "2.2412.54",
      puppeteer: {
        args: ["--no-sandbox"],
      },
    });

    client.once("ready", () => {
      console.log("👻 Ads Buster is ready!");
    });

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("message_create", async (message) => {
      console.log("==============");
      if (message.body === "!ping") {
        message.reply("pong");
      }

      if (message.body.startsWith("!kick ")) {
        const chat = await message.getChat();
        if (chat.isGroup) {
          const group = chat;
          const mentions = await message.getMentions();
          for (const mention of mentions) {
            console.log(`Kicking out`, mention);
            await group.removeParticipants([mention.id._serialized]);
            // Delete messages by this contact
            // Maybe yes, and maybe no :D
            // await mention.block();
          }
        }
      }
      console.log("==============");
    });

    await client.initialize();
  } catch (error) {
    console.error(`❌ Got error connecting to MongoDB: `, error);
  }
}

main();
