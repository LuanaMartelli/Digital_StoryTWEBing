FROM node:6.9.1-alpine

RUN curl -fsSL https://get.docker.com | sh 

ADD src/package.json /opt/micro-service/src/package.json
WORKDIR /opt/backend-api/src 
RUN npm install

COPY src /opt/backend-api/src

CMD ["npm", "start"]