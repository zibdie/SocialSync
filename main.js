require("dotenv").config();

const { DownloadTikTokByURL, GetRecentTiktoks } = require("./functions.js");

console.log(GetRecentTiktoks(process.env.TIKTOK_TEST_PROFILE));
