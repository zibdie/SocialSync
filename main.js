require("dotenv").config();
const path = require("path");

const {
  DownloadTikTokByURL,
  GetRecentTiktoks,
  GoogleAPI,
} = require("./functions.js");

if (!process.env.TIKTOK_PROFILE) {
  throw new Error("No TikTok profile provided");
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("No Google token provided");
}

if (!process.env.GOOGLE_SHEET_ID) {
  throw new Error("No Google Sheets ID provided");
}

(async () => {
  const GoogleObject = new GoogleAPI(
    process.env.GOOGLE_SHEET_ID,
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  const result = await GoogleObject.checkDuplicateRow("john", 0);
  console.log(result);
  const writeDataResult = await GoogleObject.writeNewRow(["john", "doe"]);
  console.log(writeDataResult);
  const uploadVideo = await GoogleObject.uploadVideoToYoutube(
    path.join(__dirname, "test.mp4.webm"),
    "Test video",
    "This is a test video",
    process.env.YOUTUBE_CHANNEL_ID
  );
  console.log(uploadVideo);
})();
