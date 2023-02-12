const express = require("express");
const app = express();
const port = parseInt(process.env.EXPRESSPORT) || 3000;

let appServer;

app.get("/auth/google/callback", (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");
  res.send(`${code}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function startExpressServer() {
  appServer = await app.listen(port, () => {});
}

async function stopExpressServer() {
  await appServer.close();
}

module.exports = {
  startExpressServer,
  stopExpressServer,
};
