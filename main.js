require("dotenv").config();
const path = require("path");

const {
  DownloadTikTokByURL,
  GetRecentTikToks,
  UploadToPastebin,
  UploadToImgur,
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

  const recentTikToks = await GetRecentTikToks(process.env.TIKTOK_PROFILE);
  console.log(recentTikToks);
  console.log(
    await UploadToPastebin("recent_test", JSON.stringify(recentTikToks))
  );
  //const ProcessList = [];
  // check if any row exists using the checkDuplicateRow function and the first column using its id
  /*
  for (let i = 0; i < recentTikToks.length; i++) {
    const result = await GoogleObject.checkDuplicateRow(recentTikToks[i].id, 0);
    if (!result) {
      ProcessList.push(recentTikToks[i]);
    }
  }
  */
  //console.log(recentTikToks.recent[0]);
  //console.log(await DownloadTikTokByURL(recentTikToks.recent[0].url));

  //const writeDataResult = await GoogleObject.writeNewRow(["john", "doe"]);
  /*
  const uploadVideo = await GoogleObject.uploadVideoToYoutube(
    path.join(__dirname, "test.webm"),
    "Test video",
    "This is a test video",
    process.env.YOUTUBE_CHANNEL_ID,
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  console.log(uploadVideo);
  */
})();
