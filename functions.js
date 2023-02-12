require("dotenv").config();
const SERVER_MODE = process.env.DYNO ? true : false;
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const { auth } = require("google-auth-library");
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const tempDir = path.join(__dirname, "temp");
const { startExpressServer, stopExpressServer } = require("./miniserver.js");
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

class GoogleAPI {
  constructor(sheetId, auth) {
    this.sheetId = sheetId;
    this.auth = auth;
  }

  async checkDuplicateRow(data, column) {
    // Use the Google Sheets API to get the data from the specified sheet
    const keyFile = require(this.auth);
    const client = auth.fromJSON(keyFile);
    client.scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const sheets = google.sheets({ version: "v4", auth: client });
    const sheet = await sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: "Sheet1",
    });
    const rows = sheet.data.values;
    // Iterate through the rows and check if the specified column in any of them match the data passed in
    for (const row of rows) {
      if (row[column] === data) {
        return { status: true, data: row };
      }
    }
    // Return false if no match is found
    return { status: false, data: null };
  }

  async writeNewRow(data) {
    // Use the Google Sheets API to append the data to a new row in the specified sheet
    const keyFile = require(this.auth);
    const client = auth.fromJSON(keyFile);
    client.scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const sheets = google.sheets({ version: "v4", auth: client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [data],
      },
    });
  }

  async uploadVideoToYoutube(videoPath, title, description) {
    // Load client secrets from a JSON file
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
    const LOGGED_TOKEN_PATH = SERVER_MODE
      ? process.env.GOOGLE_LOGIN_TOKEN
      : path.join(__dirname, "loggedToken.json");
    const categoryIds = {
      Entertainment: 24,
      Education: 27,
      ScienceTechnology: 28,
    };

    // Check if we have previously stored a token
    let token;
    try {
      token = JSON.parse(fs.readFileSync(LOGGED_TOKEN_PATH, "utf8")).tokens;
      oauth2Client.setCredentials(token);
    } catch (error) {
      if (error.code === "ENOENT" && SERVER_MODE) {
        console.error(
          "No token found, please run the server in local mode to generate a token"
        );
        process.exit(1);
      } else {
        console.error("Error loading token: ", error.toString());
      }
      console.log("\n\n");
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });
      await startExpressServer();
      console.log("Authorize this app by visiting this url:", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      async function getInput() {
        return new Promise((resolve, reject) => {
          rl.question("Enter the code given to you: ", (input) => {
            resolve(input);
          });
        });
      }
      try {
        const code = await getInput();
        rl.close();
        token = await oauth2Client.getToken(code);
        // Store the token to disk for later program executions
        fs.writeFileSync(LOGGED_TOKEN_PATH, JSON.stringify(token));
        await stopExpressServer();
        token = token.tokens;
        oauth2Client.setCredentials(token);
      } catch (error) {
        console.log(error);
        return;
      }
    }

    // Check if the token has expired
    if (token.expiry_date < Date.now()) {
      // Refresh the token
      console.log("Refreshing token....");
      token = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFileSync(LOGGED_TOKEN_PATH, JSON.stringify(token));
    }

    // Create a client for the YouTube API
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Upload the video to YouTube
    const videoUpload = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title,
          description,
          tags: [""],
          categoryId: categoryIds.ScienceTechnology,
          defaultLanguage: "en",
          defaultAudioLanguage: "en",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    });

    // Return the video ID
    return videoUpload.data.id;
  }
}

module.exports = {
  DownloadTikTokByURL,
  GetRecentTikToks,
  SERVER_MODE,
  GoogleAPI,
};
