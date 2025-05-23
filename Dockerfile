FROM node:18

WORKDIR /app

COPY . .

RUN npm install

ENV TZ=Asia/Seoul

EXPOSE 3000

CMD ["node", "server.js"]

