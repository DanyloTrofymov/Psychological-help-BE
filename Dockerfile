FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . /usr/src/app

ENV BASE_URL=https://getpsychohelp.com

EXPOSE 3001

RUN npm install -g @nestjs/cli
RUN npm install -g prisma

RUN npm ci
RUN npx prisma generate
RUN npm run build

CMD ["npm", "start"]