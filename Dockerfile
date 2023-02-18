FROM mcr.microsoft.com/playwright:v1.29.1-focal

ENV DEBIAN_FRONTEND=noninteractive
# If DYNO is true, then its running headless/server
ENV DYNO=true
ENV USE_TOR=false

WORKDIR /app

USER root

RUN apt-get update && apt-get install -y tor && \
    rm -rf /var/lib/apt/lists/* && chown -R pwuser /app

USER pwuser

COPY ./package.json ./package.json

RUN npm install --production

COPY . .

CMD ["node", "main.js"]