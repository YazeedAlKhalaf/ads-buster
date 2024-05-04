const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "ads-buster",
  }),
  webVersion: "2.2412.54",
});

client.once("ready", () => {
  console.log("👻 Ads Buster is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
  console.log("==============");
  //   console.log(`received a message:`, message);
  if (message.body === "!ping") {
    message.reply("pong");
  }

  if (message.body.startsWith("!kick ")) {
    const chat = await message.getChat();
    if (chat.isGroup) {
      console.log("this is a group");
      // monitor the messages if they are from a group
      // kick ads people and delete thier messages :D

      const mentions = await message.getMentions();
      mentions.forEach(async (mention) => {
        console.log(`kicking out`, mention);
        await chat.removeParticipants([mention.id._serialized]);

        // delete messages by this contact

        // maybe yes, and maybe no :D
        // await mention.block();
      });
    }
  }

  console.log("==============");
});

client.initialize();
