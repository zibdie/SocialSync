const SERVER_MODE = process.env.DYNO ? true : false;

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
    await fs.promises.rmdir(tempDir, { recursive: true });
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
    await page.goto("https://tikdown.org/");
    await page.getByPlaceholder("Paste TikTok Video link").click();
    await page.getByPlaceholder("Paste TikTok Video link").fill(TIKTOK_URL);
    await new Promise((r) => setTimeout(r, 2000));
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
    await browser.close();
    return await convertToMP4(rawFile);
  } catch (e) {
    throw new Error({ success: false, error: e });
  }
}

async function GetRecentTiktoks(profile) {
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

async function UploadToYouTube(info, videoPath) {
  return;
}

module.exports = {
  DownloadTikTokByURL,
  GetRecentTiktoks,
  SERVER_MODE,
};
