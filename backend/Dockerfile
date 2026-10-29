FROM node:20-slim

WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://crdent:crdent_dev_password@db:5432/crdent?schema=public"

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
