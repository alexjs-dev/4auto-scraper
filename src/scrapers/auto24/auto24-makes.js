const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await page.goto("https://eng.auto24.ee/");
    const INPUT_SELECTOR =
      "#item-searchParam-cmm-1-model_id > div > div > div.select-selected.no-selection";
    await page.waitForSelector(INPUT_SELECTOR);
    await page.click(INPUT_SELECTOR);
    const INPUT_OPTIONS =
      "#item-searchParam-cmm-1-make > div > div > div.select-items-container";
    await page.waitForSelector(INPUT_OPTIONS);
    // display all options, log them to the console
    const OPTION_SELECTOR =
      "#item-searchParam-cmm-1-make > div > div > div.select-items-container > div > div:nth-child(2) > span.option-value";
    const options = await page.$$(OPTION_SELECTOR);
    console.log("options", options);
  } catch (err) {
    console.error(err);
  }
  await browser.close();
})();
