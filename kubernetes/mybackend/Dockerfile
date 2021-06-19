FROM node:alpine

WORKDIR /opt/myapp

COPY ./package.json ./

RUN yarn install

COPY . .

CMD ["node", "index.js"]



