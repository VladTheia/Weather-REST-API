FROM node:12
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm install
COPY ./src /usr/app/src
EXPOSE 3000