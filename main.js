//require("dotenv").config();

const { DownloadTikTokByURL, GetRecentTiktoks } = require("./functions.js");

if (!process.env.TIKTOK_PROFILE) {
  throw new Error("No TikTok profile provided");
}
/*
if(!process.env.GOOGLE_TOKEN) {
    throw new Error("No Google token provided");
}
*/

(async () => {
  console.log(`Getting recent TikToks from @${process.env.TIKTOK_PROFILE}`);
  console.log(await GetRecentTiktoks(process.env.TIKTOK_PROFILE));
})();
