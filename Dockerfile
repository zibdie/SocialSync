FROM mcr.microsoft.com/playwright:v1.29.1-focal

ENV DEBIAN_FRONTEND=noninteractive
# If DYNO is true, then its running headless/server
ENV DYNO=true
#Switch to true if your hitting API limits too often. 
ENV USE_TOR=true

WORKDIR /app

USER root

RUN apt-get update && apt-get install -y tor && \
    rm -rf /var/lib/apt/lists/* && chown -R pwuser /app

    # Append ControlPort and HashedControlPassword to torrc. This allows Tor to be controlled via NodeJS script
RUN echo "ControlPort 9051" >> /etc/tor/torrc && \
    echo "HashedControlPassword 16:AEBC98A6777A318660659EC88648EF43EDACF4C20D564B20FF244E81DF" >> /etc/tor/torrc && \
    chown pwuser /etc/tor/torrc && chmod 600 /etc/tor/torrc

# Switch back to a nonroot user
USER pwuser

#Install packages first, makes build process faster
COPY ./package.json ./package.json

RUN npm install --production

COPY . .

CMD ["node", "main.js"]
