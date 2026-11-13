FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install
COPY server ./server
RUN npm run build -w server && npm prune --omit=dev
FROM node:22-bookworm-slim
ENV NODE_ENV=production HOME=/tmp
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer poppler-utils fonts-liberation && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/dist ./server/dist
USER node
EXPOSE 4000
CMD ["node","server/dist/index.js"]
