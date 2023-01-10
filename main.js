require("dotenv").config();

const {
  DownloadTikTokByURL,
  GetRecentTiktoks,
  CheckGoogleSheetsColumn,
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
  //console.log(`Getting recent TikToks from @${process.env.TIKTOK_PROFILE}`);
  //console.log(await GetRecentTiktoks(process.env.TIKTOK_PROFILE));
  console.log(await DownloadTikTokByURL(process.env.TIKTOK_VIDEO));
  /*
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const columnLetter = "A"; // column A
  const value = "john";
  CheckGoogleSheetsColumn(spreadsheetId, columnLetter, value).then((result) => {
    console.log(
      `All rows in column ${columnLetter} contain the value "${value}": ${result}`
    );
  });
  */
})();
