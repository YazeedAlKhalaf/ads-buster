const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const {
  initializeAuthStrategy,
  getAuthStrategy,
} = require("./src/authStrategy.js");
const { initializeStore } = require("./src/store.js");
const { addToAdminList, isAdmin } = require("./src/helpers/admins.js");
const { addToBlacklist, isBlacklisted } = require("./src/helpers/blacklist.js");

async function main() {
  try {
    await initializeStore();
    await initializeAuthStrategy();

    const client = new Client({
      authStrategy: getAuthStrategy(),
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
      try {
        console.log("==============");
        console.debug("MESSAGE RECEIVED: ", message);

        const chat = await message.getChat();
        const canDoAdminOps = (await isAdmin(message.from)) || message.fromMe;

        if (message.body === "!ping") {
          message.reply("pong");
        }

        if (message.body.startsWith("!admin ")) {
          if (canDoAdminOps) {
            const mentions = await message.getMentions();
            for (const mention of mentions) {
              console.log(`👑 Adding admin: `, mention);
              await addToAdminList(mention.id._serialized);
            }
          }
        }

        // group only commands
        if (chat.isGroup && canDoAdminOps) {
          const group = chat;
          if (message.body.startsWith("!kick ")) {
            const mentions = await message.getMentions();
            for (const mention of mentions) {
              console.log(`🥾 Kicking out`, mention);
              await group.removeParticipants([mention.id._serialized]);

              // this is just ot make sure whatsapp doesn't ban us :D
              await new Promise((resolve) => setTimeout(resolve, 750));

              // Delete messages by this contact
              // Maybe yes, and maybe no :D
              // await mention.block();
            }
          } else if (message.body === "!ad" && message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();

            if (quoted.author) {
              console.log("🔥 Burning AD from: ", quoted.author);
              await group.removeParticipants([quoted.author]);

              // delete the message of the ad sender
              await quoted.delete(true);

              // remove participant from all groups the bot is in
              const chats = await client.getChats();
              for (const chat of chats) {
                if (chat.isGroup) {
                  const theGroup = chat;
                  theGroup.participants.forEach(async (participant) => {
                    if (participant.id._serialized === quoted.author) {
                      console.log(
                        `🥾 Attempting to kick out ${quoted.author} from ${theGroup.name}`
                      );

                      await theGroup.removeParticipants([quoted.author]);

                      // this is just ot make sure whatsapp doesn't ban us :D
                      await new Promise((resolve) => setTimeout(resolve, 750));
                    }
                  });
                }
              }

              // add the ad sender id to the block list in filesystem as json map, so it is efficient
              await addToBlacklist(quoted.author);
            }
          }
        }

        console.log("==============");
      } catch (error) {
        console.error("Error in message_create handler:", error);
      }
    });

    // add event to listen to new group members, and kick them if they are in the block list
    client.on("group_join", async (notification) => {
      try {
        console.log("👥 New member joined: ", notification);

        const group = await notification.getChat();
        console.log("👥 Group: ", group);

        const recipients = await notification.getRecipients();
        recipients.forEach(async (recipient) => {
          const newMemberId = recipient.id._serialized;

          if (await isBlacklisted(newMemberId)) {
            console.log(`🥾 Kicking out`, newMemberId);
            await group.removeParticipants([newMemberId]);
          }
        });
      } catch (error) {
        console.error("Error in group_join handler:", error);
      }
    });

    await client.initialize();
  } catch (error) {
    console.error(`❌ Got error connecting to MongoDB: `, error);
  }
}

main();
