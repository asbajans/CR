# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npx tsc

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV="production"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

ENV DATABASE_URL="postgresql://crdent:crdent_dev_password@db:5432/crdent?schema=public"

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
