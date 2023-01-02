FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DYNO true

# Define your parameters here
ARG TIKTOK_PROFILE
ARG GOOGLE_TOKEN

RUN apt-get update && \
    apt-get install -y curl ffmpeg && \
    curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh && bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs


COPY . .

RUN npm install && npx playwright install-deps chromium


CMD ["node", "main.js"]