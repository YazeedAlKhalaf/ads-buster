const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "ads-buster",
  }),
});

client.once("ready", () => {
  console.log("👻 Ads Buster is ready!");
});

client.on("qr", (qr) => {
  //   console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("message_create", (message) => {
  console.log(`received a message:`, message);
  if (message.body === "!ping") {
    message.reply("pong");
  }
});

client.initialize();
