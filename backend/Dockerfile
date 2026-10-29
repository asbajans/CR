FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://crdent:crdent_dev_password@db:5432/crdent?schema=public"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
