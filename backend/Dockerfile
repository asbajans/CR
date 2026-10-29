FROM node:20-alpine

WORKDIR /app

ENV DATABASE_URL="postgresql://crdent:crdent_dev_password@db:5432/crdent?schema=public"
ENV NODE_ENV="production"

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npx tsc

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
