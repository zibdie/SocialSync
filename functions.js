const SERVER_MODE = process.env.DYNO ? true : false;

async function DownloadTikTokByURL(URL) {
  const { chromium } = require("playwright-extra");
  const stealth = require("puppeteer-extra-plugin-stealth")();
  chromium.use(stealth);

  const browser = await chromium.launch({ headless: SERVER_MODE });

  const page = await browser.newPage();
  await page.goto("<NEED FIND SERVICE HERE>", {
    waitUntil: "networkidle",
  });

  await page.getByPlaceholder("Enter TikTok URL").click();
  await page.getByPlaceholder("Enter TikTok URL").fill(URL);
  await page.getByRole("button", { name: "Download" }).click();
  //sleep for 20 seconds - debug
  await new Promise((r) => setTimeout(r, 20000));
  await browser.close();
  return;
}

async function GetRecentTiktoks(profile) {
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

  console.log(pageResult);

  await browser.close();
  return;
}

module.exports = {
  DownloadTikTokByURL,
  GetRecentTiktoks,
  SERVER_MODE,
};
