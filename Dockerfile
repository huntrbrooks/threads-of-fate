# Simple Dockerfile for Next.js app with Edge-compatible runtime
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json .
RUN npm i --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm","run","start"]

