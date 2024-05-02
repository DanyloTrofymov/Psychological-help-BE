FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . /usr/src/app
ARG DATABASE_URL
ARG JWT_SECRET
ARG TELEGRAM_BOT_TOKEN

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV TELEGRAM_BOT_TOKEN = $TELEGRAM_BOT_TOKEN
ENV BASE_URL=https://getpsychohelp.com


EXPOSE 3001

RUN npm install -g @nestjs/cli
RUN npm install -g prisma

RUN npm ci
RUN npx prisma generate
RUN npm run build

CMD ["npm", "start"]