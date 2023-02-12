// basic express starter code

const express = require("express");
const app = express();
const port = 3000;

let appServer;

app.get("/auth/google/callback", (req, res) => {
  // get the code from the query string
  const code = req.query.code;
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
