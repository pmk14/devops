FROM node:alpine

WORKDIR /opt/myapp

COPY ./package.json ./

RUN yarn install

COPY . .

CMD ["yarn", "dev"]


