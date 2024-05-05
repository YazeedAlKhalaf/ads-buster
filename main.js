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

    client.on("authenticated", (session) => {
      console.log("🔑 Authenticated!");
    });

    client.on("auth_failure", (msg) => {
      console.error("❌ Auth failure: ", msg);
    });

    client.on("disconnected", (reason) => {
      console.error("❌ Disconnected: ", reason);

      // Clean up
      client.destroy();
      process.exit();
    });

    client.on("loading_screen", () => {
      console.log("⏳ Loading screen...");
    });

    client.on("change_state", (state) => {
      console.log("🔄 State changed: ", state);
    });

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.once("ready", async () => {
      console.log("👻 Ads Buster is ready!");

      try {
        // check all groups for blacklisted users and kick them out
        const chats = await client.getChats();
        for (const chat of chats) {
          if (chat.isGroup) {
            /**
             * @type {import('whatsapp-web.js').GroupChat}
             */
            const group = chat;
            const participants = group.participants;
            for (const participant of participants) {
              const isBlacklistedUser = await isBlacklisted(
                participant.id._serialized
              );
              if (isBlacklistedUser) {
                console.log(
                  `🥾 Kicking out blacklisted user: `,
                  participant.id._serialized
                );

                // check if i am an admin in this group
                let isCurrentUserAdmin = false;
                group.participants.forEach((participant) => {
                  const isParticipantAdmin =
                    participant.isAdmin || participant.isSuperAdmin;
                  const isParticipantCurrentUser =
                    participant.id._serialized === client.info.wid._serialized;
                  if (isParticipantCurrentUser && isParticipantAdmin) {
                    isCurrentUserAdmin = true;
                  }
                });

                if (isCurrentUserAdmin) {
                  // add delay to avoid getting banned by whatsapp
                  await new Promise((resolve) => setTimeout(resolve, 550));
                  await group.removeParticipants([participant.id._serialized]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in ready handler:", error);
      }
    });

    client.on("message_create", async (message) => {
      try {
        console.log("==============");
        console.debug("MESSAGE RECEIVED: ", message);

        const chat = await message.getChat();
        const canDoAdminOps =
          (await isAdmin(message.author ?? "")) || message.fromMe;

        if (message.body === "!ping") {
          message.reply("pong");
        }

        if (message.body.startsWith("!admin ") && canDoAdminOps) {
          const mentions = await message.getMentions();
          for (const mention of mentions) {
            console.log(`👑 Adding admin: `, mention);
            await addToAdminList(mention.id._serialized, message.author);
          }
        }

        // group only commands
        if (chat.isGroup && canDoAdminOps) {
          /**
           * @type {import('whatsapp-web.js').GroupChat}
           */
          const group = chat;
          if (message.body.startsWith("!kick ")) {
            const mentions = await message.getMentions();
            for (const mention of mentions) {
              console.log(`🥾 Kicking out`, mention);
              await group.removeParticipants([mention.id._serialized]);
              await addToBlacklist(
                mention.id._serialized,
                message.author,
                "!kick"
              );

              // this is just ot make sure whatsapp doesn't ban us :D
              await new Promise((resolve) => setTimeout(resolve, 750));

              // Delete messages by this contact
              // Maybe yes, and maybe no :D
              // await mention.block();
            }
          } else if (message.body === "!ad" && message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            const authorToBurn = quoted.author;

            let canStartBurningAd = true;

            // check if the author is an admin
            const isAuthorAdmin = await isAdmin(authorToBurn);
            if (isAuthorAdmin) {
              console.log("👑 Admin detected: ", authorToBurn);
              canStartBurningAd = false;
            }

            // check if the author is blacklisted
            const isAuthorBlacklisted = await isBlacklisted(authorToBurn);
            if (isAuthorBlacklisted) {
              console.log("🚫 Blacklisted user detected: ", authorToBurn);
              canStartBurningAd = false;
            }

            if (canStartBurningAd) {
              console.log("🔥 Burning AD from: ", authorToBurn);

              await addToBlacklist(authorToBurn, message.author, "!ad");
              await group.removeParticipants([authorToBurn]);
              await new Promise((resolve) => setTimeout(resolve, 500)); // wait a bit, just to make sure the participant is removed
              await quoted.delete(true); // delete reported message
              await new Promise((resolve) => setTimeout(resolve, 500)); // wait a bit, just to make sure the message is deleted
              await message.delete(true); // delete report message

              // remove this ad sender from all groups the bot is in.
              const chats = await client.getChats();
              for (const chat of chats) {
                if (chat.isGroup) {
                  const theGroup = chat;

                  let isCurrentUserAdmin = false;
                  theGroup.participants.forEach((participant) => {
                    const isParticipantAdmin =
                      participant.isAdmin || participant.isSuperAdmin;
                    const isParticipantCurrentUser =
                      participant.id._serialized ===
                      client.info.wid._serialized;
                    if (isParticipantCurrentUser && isParticipantAdmin) {
                      isCurrentUserAdmin = true;
                    }
                  });

                  if (isCurrentUserAdmin) {
                    theGroup.participants.forEach(async (participant) => {
                      if (participant.id._serialized === authorToBurn) {
                        console.log(
                          `🥾 Kicking out ${authorToBurn} from ${theGroup.name}`
                        );

                        await theGroup.removeParticipants([authorToBurn]);

                        // this is just ot make sure whatsapp doesn't ban us :D
                        await new Promise((resolve) =>
                          setTimeout(resolve, 750)
                        );
                      }
                    });
                  } else {
                    console.log(
                      `❌ I'm not an admin in ${theGroup.name}, can't kick out ${authorToBurn}`
                    );

                    let authorUser = authorToBurn.split("@");
                    if (authorUser.length != 2) {
                      console.error(
                        `❌ Invalid author user: ${authorToBurn}, skipping`
                      );
                      return;
                    }
                    authorUser = authorUser[0];

                    // get admins to mention them
                    const admins = theGroup.participants.filter(
                      (participant) =>
                        participant.isAdmin || participant.isSuperAdmin
                    );

                    const mentions = [];
                    let adminMentionsMessagePart = "";
                    admins.forEach((admin) => {
                      adminMentionsMessagePart += `@${admin.id.user} `;

                      mentions.push(admin.id._serialized);
                    });
                    adminMentionsMessagePart = adminMentionsMessagePart.trim();
                    adminMentionsMessagePart =
                      adminMentionsMessagePart === ""
                        ? ""
                        : "\n\n" + adminMentionsMessagePart;

                    // Send a fun message to the group to inform the admin
                    await theGroup.sendMessage(
                      `🚨 ALERT! 🚨 An AD sender has been detected! Quick, someone grab the boot! 🥾
  
🕵️ Detected AD sender: @${authorUser}
  
Your friendly neighborhood Ad Buster is here to save the day! 👻
  
P.S. Let's make me an admin so I can kick out these pesky AD senders automatically in the future! 😇${adminMentionsMessagePart}`,
                      {
                        mentions: [authorToBurn, ...mentions],
                      }
                    );
                  }
                }

                // this is just ot make sure whatsapp doesn't ban us :D
                await new Promise((resolve) => setTimeout(resolve, 750));
              }
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
