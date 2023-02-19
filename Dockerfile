FROM mcr.microsoft.com/playwright:v1.29.1-focal

ENV DEBIAN_FRONTEND=noninteractive
# If DYNO is true, then its running headless/server
ENV DYNO=true
ENV USE_TOR=true

WORKDIR /app

USER root

RUN apt-get update && apt-get install -y tor && \
    rm -rf /var/lib/apt/lists/* && chown -R pwuser /app

    # Append ControlPort and HashedControlPassword to torrc
RUN echo "ControlPort 9051" >> /etc/tor/torrc && \
    echo "HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF" >> /etc/tor/torrc && \
    chown pwuser /etc/tor/torrc && chmod 600 /etc/tor/torrc

USER pwuser

COPY ./package.json ./package.json

RUN npm install --production

COPY . .

CMD ["node", "main.js"]