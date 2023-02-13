FROM mcr.microsoft.com/playwright:v1.29.1-focal

ENV DEBIAN_FRONTEND=noninteractive
# If DYNO is true, then its running headless/server
ENV DYNO=true

COPY ./package.json ./package.json

RUN npm install

COPY . .

CMD ["node", "main.js"]