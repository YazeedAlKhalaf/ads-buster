# 👻 WhatsApp Ads Buster

Tired of annoying ads in your university WhatsApp groups? Me too! That’s why I created WhatsApp Ads Buster. Let’s make our student life quieter and ad-free! 🎉

> For .wwebjs_cache versions, check this link: [WhatsApp Web Versions](https://github.com/wppconnect-team/wa-version/tree/main/html)

## 📑 Table of Contents

- [👻 WhatsApp Ads Buster](#-whatsapp-ads-buster)
  - [📑 Table of Contents](#-table-of-contents)
  - [📘 Introduction](#-introduction)
  - [🚀 How to Run](#-how-to-run)
    - [📋 Requirements](#-requirements)
    - [🏃‍♂️ Quick Start](#️-quick-start)
    - [🛠️ Manual Setup](#️-manual-setup)
  - [✨ Features](#-features)
  - [🤝 How to Contribute](#-how-to-contribute)
    - [Contribution Guidelines](#contribution-guidelines)
  - [📜 License](#-license)

## 📘 Introduction

WhatsApp Ads Buster is a bot designed to help you automatically remove annoying ads from your university WhatsApp groups. By adding this bot to your groups, you can ensure a cleaner and more focused group chat experience.

## 🚀 How to Run

### 📋 Requirements

- 🐳 Docker
- 🐳 Docker Compose plugin
- 📱 A WhatsApp account to act as the ads buster in groups

> **Note:** Use a new WhatsApp account that you don't mind getting banned. I recommend using a pre-paid number.
>
> This new number will be the "ads-buster" that you **add to groups as an admin** where you want the bot to take action.

### 🏃‍♂️ Quick Start

1. Get a number for the ads-buster.
2. Set the required environment variables (e.g., `MONGO_EXPRESS_ADMIN_PASSWORD`).
3. Run the following command to start the services:

```
docker compose up
```

This command will start the following services:

- **MongoDB**: Database service running on port `27017`.
- **Mongo Express**: Web-based MongoDB admin interface running on port `8081`. Access it via `http://localhost:8081` (Default username: `admin`, password: set via environment variable `MONGO_EXPRESS_ADMIN_PASSWORD`).
- **Ads Buster Bot**: The main bot service.

4. Check the logs and scan the QR code to authenticate.

### 🛠️ Manual Setup

If you prefer to run it manually, you’ll need a MongoDB instance and Node.js. Docker is easier, but here’s how you can do it:

1. Install dependencies:

```
pnpm install
```

2. Run the Node.js application:

```
pnpm start
```

## ✨ Features

To use the features, the bot must be in the group. Trusted admins can use the following commands. The bot is a trusted admin by default and can add more trusted users. Trusted admins can also add more admins.

- **Commands for "trusted admins":**
  - `!ad`: Reply to an ad with this command, and the bot will kick the ad sender from the group and all other groups it is in. The sender will be blacklisted.
    - **Example:** Respond to an ad message with `!ad` to kick the sender from all groups.
  - `!kick`: Mention a user with `@` and use this command to kick them from the group. The user will also be blacklisted.
    - **Example:** `!kick @username` to remove the user from the group and blacklist them.
  - `!admin`: Allows trusted admins to add more admins. Use this command with the bot account to add the first trusted admin.
    - **Example:** `!admin @username` to grant admin privileges to the user.
- **Commands for everyone:**
  - `!ping`: A simple test command. The bot will reply with `pong`.
    - **Example:** Type `!ping` to check if the bot is active.

## 🤝 How to Contribute

We welcome contributions! Here’s how you can get involved:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

### Contribution Guidelines

- Follow the coding standards used in the project.
- Write clear, concise commit messages.
- Include comments in your code where necessary.
- Ensure your changes do not break existing functionality.

## 📜 License

This project is licensed under GPL v3. Make sure to comply with it when using, especially if you plan to use it privately.
