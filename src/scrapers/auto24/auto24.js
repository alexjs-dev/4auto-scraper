const puppeteer = require("puppeteer");
const cache = require("../../cache");
const selectors = require("./selectors");
const axios = require("axios");
const { uniq } = require("lodash");
const {
  getIdFromHref,
  getLangUrl,
  getBaseData,
  getHtmlAsText,
  getItemData,
  escapeDangerousHtml,
} = require("./helpers");

const vehicleTypeWhiteList = ["passenger car", "suv", "truck"];

const jwtToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJpYXQiOjE2NzY4OTcxMzUsImV4cCI6MTY3OTQ4OTEzNSwiYXVkIjoiaHR0cHM6Ly80YXV0by5lZSIsImlzcyI6IjRhdXRvIiwic3ViIjoiNjM5ZGU0N2JhMjBhODI2NTUzNjkzY2IxIiwianRpIjoiZjdhNzRmYjctZGQ4OC00MTUwLTkyNzktODAzZjE1MzE2ZGMxIn0.K-_WOyQ9A0nbSDUvQXcH4tnaag9zHGaNDsyysZrAOf0";

const MB_LINK =
  "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&b=12&ae=8&af=100&ssid=83923957";
const AUDI_LINK =
  "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&b=2&ae=8&af=100&ssid=84355954";
const JAGUAR_LINK =
  "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&aj=&ssid=91205913&b=36&ae=8&af=100&otsi=search";

const BMW_LINK =
  "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&aj=&ssid=83923957&b=4&ae=8&af=100&otsi=search";

const PORSHE_LINK =
  "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&b=140&ae=8&af=100&ssid=91213504";
const skipIds = [];
const MAX_LINKS = 200;

const START_URL = PORSHE_LINK;
let links = [];
const REQUEST_ENABLED = true;

const getLinksOnAPage = async (page) => {
  // Wait for the element with class ".result-row" to appear on the page
  await page.waitForSelector(".result-row");
  // Query for all elements with class ".result-row" and print them to the console
  const elements = await page.$$(".result-row");
  for (const element of elements) {
    const link = await element.$("a"),
      href = await page.evaluate((link) => link.href, link);
    links.push(href);
  }
};

// https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&b=12&ae=8&af=100&ssid=83923957
// https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&b=12&ae=8&af=100&ssid=83923957&ak=100

const scrapeListings = async (page) => {
  // function to scrape all listings on a page, then go to the next page and repeat
  console.log("Getting listings on page...");
  console.log("Currently gathered links:", links.length);
  await getLinksOnAPage(page);

  if (MAX_LINKS && links.length >= MAX_LINKS) {
    console.log("Max links reached, stopping...");
    return;
  }
  const nextPageSelector = selectors.nextPage;
  const nextPageSelector2 = selectors.nextPage2;

  let nextPageElementHref;

  try {
    const nextPageElement = await page.$(nextPageSelector);
    nextPageElementHref = await page.evaluate(
      (nextPageElement) => nextPageElement.href,
      nextPageElement
    );
  } catch (e) {}
  try {
    const nextPageElement = await page.$(nextPageSelector2);
    nextPageElementHref = await page.evaluate(
      (nextPageElement) => nextPageElement.href,
      nextPageElement
    );
  } catch (e) {}
  if (nextPageElementHref) {
    await page.goto(nextPageElementHref);
    // wait one second
    await new Promise((resolve) => setTimeout(resolve, 500));
    await scrapeListings(page);
  }
};

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await page.goto(START_URL);
    await scrapeListings(page);
    console.log("Gathered links:", links.length);
    console.log("Starting to add listings to the database...");

    for (const link of links) {
      const listingId = getIdFromHref(link);
      console.log("id: ", listingId);
      const isExistingListing = await cache.get(listingId);
      if (isExistingListing || skipIds.includes(listingId)) {
        console.log("Listing already exists, skipping...");
        continue;
      }
      await page.goto(link);

      const vehicleType = await getItemData(
        page,
        selectors.vehicleTypeSelector
      );

      if (!vehicleTypeWhiteList.includes(vehicleType.toLowerCase())) {
        console.log(vehicleType + "Invalid vehicle type, skipping...");
        continue;
      }

      const data = await getBaseData(page);

      const meta1_eng = await getHtmlAsText(page, selectors.meta1);
      const meta2_eng = await getHtmlAsText(page, selectors.meta2);

      const urlRus = getLangUrl(link, "ru");
      const urlEst = getLangUrl(link, "ee");

      // add delay
      await new Promise((resolve) => setTimeout(resolve, 750));
      await page.goto(urlRus);
      const meta1_rus = await getHtmlAsText(page, selectors.meta1);
      const meta2_rus = await getHtmlAsText(page, selectors.meta2);
      await new Promise((resolve) => setTimeout(resolve, 750));
      await page.goto(urlEst);
      const meta1_est = await getHtmlAsText(page, selectors.meta1);
      const meta2_est = await getHtmlAsText(page, selectors.meta2);

      // download all images galleryImages
      // for (const image of data.galleryImages) {
      //   await new Promise((resolve) => setTimeout(resolve, 250));
      //   await downloadImage(image);
      // }

      const payload = {
        ...data,
        vehicleType: "passenger car",
        listingUrl: urlEst, // keep original listing url
        original: {
          title: data.title,
          id: listingId,
          url: link,
          description: data.description,
          galleryImages: data.galleryImages,
          mainImage: data.mainImage,
        },
        meta: {
          en: escapeDangerousHtml(meta1_eng + meta2_eng),
          ru: escapeDangerousHtml(meta1_rus + meta2_rus),
          ee: escapeDangerousHtml(meta1_est + meta2_est),
        },
      };

      // console.log("payload", payload);

      // api url localhost:3030/listings
      // set cookie with jwt token

      if (REQUEST_ENABLED) {
        try {
          await axios.post("http://localhost:3030/listings", payload, {
            headers: {
              Cookie: `token=${jwtToken}`,
            },
          });
        } catch (e) {}
        cache.set(listingId, true);
      }
    }

    // Close the browser
  } catch (err) {
    console.error(err);
  }
  await browser.close();
})();
