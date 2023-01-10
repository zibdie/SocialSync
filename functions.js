require("dotenv").config();
const SERVER_MODE = process.env.DYNO ? true : false;
const { google } = require("googleapis");

const fs = require("fs");
const path = require("path");
const tempDir = path.join(__dirname, "temp");
const FfmpegCommand = require("fluent-ffmpeg");

// generate random string function
function randomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function createTempDir() {
  try {
    await fs.promises.rm(tempDir, { recursive: true });
  } catch (err) {
    // ignore error if directory doesn't exist
  }
  try {
    await fs.promises.mkdir(path.join(tempDir, "raw"), {
      recursive: true,
    });
    await fs.promises.mkdir(path.join(tempDir, "processed"), {
      recursive: true,
    });
  } catch (err) {
    throw new Error(err);
  }
  await new Promise((r) => setTimeout(r, 2000));
}

async function UploadToImgur(url) {
  return 0;
}

async function UploadToPastebin(info) {
  return 0;
}

async function convertToMP4(file) {
  try {
    const ffmpeg = new FfmpegCommand();
    const outputDir = path.join(tempDir, "processed", `output.mp4`);
    await ffmpeg.input(file).format("mp4").output(outputDir).run();
    return { success: true, path: outputDir };
  } catch (e) {
    throw new Error({ success: false, error: e });
  }
}

async function DownloadTikTokByURL(TIKTOK_URL) {
  try {
    const getRandomString = randomString(10);
    await createTempDir(getRandomString);
    const { chromium } = require("playwright-extra");
    const stealth = require("puppeteer-extra-plugin-stealth")();
    chromium.use(stealth);

    const browser = await chromium.launch({
      headless: SERVER_MODE,
      downloadsPath: path.join(tempDir, "raw"),
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://tikdown.org/", {
      waitUntil: "networkidle",
    });
    await page.getByPlaceholder("Paste TikTok Video link").click();
    await page.getByPlaceholder("Paste TikTok Video link").fill(TIKTOK_URL);
    await page.getByRole("button", { name: "Get\nVideo" }).click();
    await page.waitForResponse(
      (response) =>
        response.url("").includes("/getAjax") && response.status() === 200
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "MP4 (Video)" }).click();
    const download = await downloadPromise;
    const rawFile = path.join(tempDir, "raw", getRandomString);
    await download.saveAs(rawFile);
    await page.goto(TIKTOK_URL, {
      waitUntil: "networkidle",
    });
    const videoInfo = await page.evaluate(() => {
      const info = {};
      info["description"] = document.querySelector(
        `div[data-e2e="browse-video-desc"]`
      ).textContent;
      info["upload_date"] = Date.parse(
        document
          .querySelector(`span[data-e2e="browser-nickname"]`)
          .textContent.replaceAll(" ", "")
          .split("·")[1]
      );
      info["displayName"] = document
        .querySelector(`span[data-e2e="browser-nickname"]`)
        .textContent.replaceAll(" ", "")
        .split("·")[0];
      info["music"] = document.querySelector(
        `h4[data-e2e="browse-music"]`
      ).textContent;
      info["profile_url"] = document
        .querySelector(`a[data-e2e="browse-user-avatar"]`)
        .querySelector("img").src;

      return info;
    });
    await new Promise((r) => setTimeout(r, 10000));
    await browser.close();
    const videoConvertResults = await convertToMP4(rawFile);
    if (!videoConvertResults.success) {
      throw new Error(videoConvertResults.error);
    }
    return { success: true, path: videoConvertResults.path, info: videoInfo };
  } catch (e) {
    throw new Error({ success: false, error: e });
  }
}

async function GetRecentTikToks(profile) {
  try {
    const { chromium } = require("playwright-extra");
    const stealth = require("puppeteer-extra-plugin-stealth")();
    chromium.use(stealth);

    const browser = await chromium.launch({ headless: SERVER_MODE });

    const page = await browser.newPage();
    await page.goto(`https://tiktok.com/@${profile}`, {
      waitUntil: "networkidle",
    });

    const pageResult = await page.evaluate(() => {
      /* Use 'var' when injecting JS instead of 'let' and/or 'const' */
      var resultURLFetched = [];
      var allTokUrlsFoundOnPage = document
        .querySelector(`div[data-e2e="user-post-item-list"]`)
        .querySelectorAll(`div[data-e2e="user-post-item"]`);
      for (let i = 0; i < allTokUrlsFoundOnPage.length; i++) {
        var ahrefref = allTokUrlsFoundOnPage[i].querySelector("a").href;
        resultURLFetched.push(ahrefref);
      }
      return resultURLFetched;
    });

    await browser.close();
    return { success: true, data: pageResult };
  } catch (e) {
    throw new Error({ success: false, error: e });
  }
}

async function CheckGoogleSheetsColumn(
  spreadsheetId,
  columnLetter,
  value,
  newEntry = {}
) {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const request = {
    spreadsheetId,
    range: `Sheet1!${columnLetter}1:${columnLetter}`, // get all rows in the column
    majorDimension: "COLUMNS", // read the data by columns
  };
  const response = await sheets.spreadsheets.values.get(request);
  const values = response.data.values;
  console.log(values);
}

async function UploadToYouTube(info, videoPath) {
  return;
}

module.exports = {
  DownloadTikTokByURL,
  GetRecentTikToks,
  CheckGoogleSheetsColumn,
  SERVER_MODE,
};
