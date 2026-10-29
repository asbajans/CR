FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build

# Verify build output exists
RUN ls -la dist/src/index.js

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
