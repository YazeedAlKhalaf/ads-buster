FROM node:22.1.0-alpine

WORKDIR /app

# Install Chromium dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY . .

RUN npm install -g pnpm

RUN pnpm install

CMD ["pnpm", "start"]
