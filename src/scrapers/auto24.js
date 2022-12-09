const puppeteer = require("puppeteer");

const vehicleTypeWhiteList = [
  "passenger car",
  "suv",
  "truck",
  //   "commercial vehicle",
];

const fuelWhiteList = ["petrol", "diesel", "hybrid", "electric", "other"];

const DEFAULT_TIMEOUT = 1000;
const getItemData = async (page, selector) => {
  try {
    const item = await page.waitForSelector(selector, {
      timeout: DEFAULT_TIMEOUT,
    });
    const text = item
      ? await page.evaluate((item) => item.innerText, item)
      : "";
    return text;
  } catch (err) {
    return "";
  }
};

const getHtmlAsText = async (page, selector) => {
  try {
    const item = await page.waitForSelector(selector, {
      timeout: DEFAULT_TIMEOUT,
    });
    const text = item
      ? await page.evaluate((item) => item.innerHTML, item)
      : "";
    return text;
  } catch (err) {
    return "";
  }
};

const getHref = async (page, selector) => {
  try {
    const item = await page.waitForSelector(selector, {
      timeout: DEFAULT_TIMEOUT,
    });
    const href = item ? await page.evaluate((item) => item.href, item) : "";
    return href;
  } catch (err) {
    return "";
  }
};

const getHrefArray = async (page, selector) => {
  try {
    // Query for all elements matching the selector using page.$$()
    const item = await page.waitForSelector(selector, {
      timeout: DEFAULT_TIMEOUT,
    });

    // Create an empty array to store the hrefs
    const hrefs = [];

    // Get a list of all <a> tags
    const links = await item.$$("a");
    // Get their href attribute
    for (const link of links) {
      const href = await page.evaluate((link) => link.href, link);
      hrefs.push(href);
    }

    // Return the hrefs array
    return hrefs;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const parsePrice = (priceString, discountedPriceString) => {
  // example input "EUR 9200"
  // example output { currency: "EUR", price: 9200 }
  // replace &nbsp with space
  priceString = priceString.replace(/\u00a0/g, " ");
  discountedPriceString = discountedPriceString.replace(/\u00a0/g, " ");
  const [currency, price] = priceString.split(" ");
  const [currencyDiscounted, discountedPrice] =
    discountedPriceString.split(" ");
  return {
    currency: currency || currencyDiscounted || "EUR",
    price: parseInt(price || discountedPrice || 0),
    discountedPrice: (discountedPrice && parseInt(discountedPrice)) || "",
  };
};

const parseMileage = (mileageString) => {
  // input: "287 500 km". output: 287500
  return parseInt(mileageString.replace(/\s/g, "").replace("km", ""));
};

const escapeDangerousHtml = (htmlString) => {
  // replace all <script> tags with empty string
  // replace all href="javascript:..." with empty string
  return htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/href="javascript:.*?"/gi, "");
};

const parseEngine = (engineString) => {
  // input: 3.0 V6 TDI 190kW. output: { capacity: 3000, power: 190, meta: "V6 TDI" }

  const capacity = engineString.split(" ")[0];
  // find string that has kW
  const power = engineString.match(/\d+kW/)[0];
  const meta = engineString.replace(capacity, "").replace(power, "").trim();
  return {
    capacity: parseInt(capacity) * 1000,
    power: parseInt(power),
    meta,
  };
};

const parseConsumption = (consumptionString) => {
  // input: "6.3 l/100km". output: 6.3
  return parseFloat(consumptionString.replace("l/100km", ""));
};

const normalizeDriveTrain = (driveTrainString) => {
  const driveTrainMapping = {
    "rear-wheel drive": "rearWheel",
    "front-wheel drive": "frontWheel",
    "four-wheel drive": "fourWheel",
  };
  return driveTrainMapping[driveTrainString] || "";
};

const normalizeTransmission = (transmissionString) => {
  // grab first word
  const transmission = transmissionString.split(" ")[0];
  return transmission.toString();
};

const normalizeFuel = (fuelString) => {
  // use fuelWhiteList to normalize fuel, otherwise return "other"
  const fuel = fuelWhiteList.find((fuel) => fuelString.includes(fuel));
  return fuel || "other";
};

(async () => {
  const browser = await puppeteer.launch();
  try {
    // Launch a new browser instance

    // Create a new page
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    // Set a long timeout to ensure that the page has enough time to load
    // await page.setDefaultNavigationTimeout(3000);

    // Go to the specified page
    await page.goto(
      "https://eng.auto24.ee/kasutatud/nimekiri.php?bn=2&a=100&aj=&ssid=83134551&j%5B%5D=1&g1=4500&g2=4500&k1=120&k2=120&ae=8&af=50&otsi=search"
    );

    // Wait for the element with class ".result-row" to appear on the page
    await page.waitForSelector(".result-row");

    // Query for all elements with class ".result-row" and print them to the console
    const elements = await page.$$(".result-row");

    let links = [];
    // get all anchor tags within the elements and print their href attribute
    for (const element of elements) {
      const link = await element.$("a"),
        href = await page.evaluate((link) => link.href, link);
      console.log(href);
      links.push(href);
    }

    // go to each link and get the data
    for (const link of links) {
      await page.goto(link);

      const vehicleTypeSelector =
        "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-liik > td.field";
      const vehicleType = await getItemData(page, vehicleTypeSelector);

      if (!vehicleTypeWhiteList.includes(vehicleType)) {
        console.log("Invalid vehicle type, skipping...");
        continue;
      }

      const selectors = {
        bodyType:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-keretyyp > td.field",
        engine:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-mootorvoimsus > td.field",
        fuel: "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-kytus > td.field",
        mileage:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-labisoit > td.field > span.value",
        driveTrain:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-vedavsild > td.field",
        transmission:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-kaigukast_kaikudega > td.field",
        regDate:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-month_and_year > td.field > span",
        price:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-hind > td.field > span.value",
        priceDiscounted:
          "body > div.tpl-body > div.tpl-content > div > div.topSection > div.topSection__mainData > table > tbody > tr.field-soodushind > td.field > span.value",
        mainImage: "#lightgallery > div.vImages__first > a",
        galleryImages: "#lightgallery > div.vImages__other",
        description:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.other-info > div.-user_other",
        avgCityFuelCons:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vTechData.-has-more > div.vFlexColumns > div.tech-data.col-1 > table:nth-child(4) > tbody > tr:nth-child(2) > td.value",
        avgHwFuelCons:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vTechData.-has-more > div.vFlexColumns > div.tech-data.col-1 > table:nth-child(4) > tbody > tr:nth-child(3) > td.value",
        avgCombFuelCons:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vTechData.-has-more > div.vFlexColumns > div.tech-data.col-1 > table:nth-child(4) > tbody > tr:nth-child(4) > td.value",
        meta1:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vEquipment.-has-more > div.vFlexColumns > div.equipment.col-1",
        meta2:
          "body > div.tpl-body > div.tpl-content > div > div.middleSection > div.middleSection__data > div.section.vEquipment.-has-more > div.vFlexColumns > div.equipment.col-2",
      };

      const bodyType = await getItemData(page, selectors.bodyType);
      const engine = await getItemData(page, selectors.engine);
      const fuel = await getItemData(page, selectors.fuel);
      const mileage = await getItemData(page, selectors.mileage);
      const driveTrain = await getItemData(page, selectors.driveTrain);
      const transmission = await getItemData(page, selectors.transmission);
      const price = await getItemData(page, selectors.price);
      const priceDiscounted = await getItemData(
        page,
        selectors.priceDiscounted
      );
      const regDate = await getItemData(page, selectors.regDate);
      const mainImage = await getHref(page, selectors.mainImage);
      const galleryImages = await getHrefArray(page, selectors.galleryImages);
      const description = await getItemData(page, selectors.description);
      const avgCityFuelCons = await getItemData(
        page,
        selectors.avgCityFuelCons
      );
      const avgHwFuelCons = await getItemData(page, selectors.avgHwFuelCons);
      const avgCombFuelCons = await getItemData(
        page,
        selectors.avgCombFuelCons
      );

      const meta1 = await getHtmlAsText(page, selectors.meta1);
      const meta2 = await getHtmlAsText(page, selectors.meta2);

      console.log({
        vehicleType: vehicleType.toLowerCase(),
        bodyType: bodyType.toLowerCase(),
        engine: parseEngine(engine),
        fuel: normalizeFuel(fuel),
        mileage: parseMileage(mileage) || 0,
        driveTrain: normalizeDriveTrain(driveTrain),
        transmission: normalizeTransmission(transmission) || "",
        price: parsePrice(price, priceDiscounted),
        regDate,
        mainImage,
        galleryImages,
        description,
        avgCityFuelCons: parseConsumption(avgCityFuelCons),
        avgHwFuelCons: parseConsumption(avgHwFuelCons),
        avgCombFuelCons: parseConsumption(avgCombFuelCons),
        meta: escapeDangerousHtml(meta1 + meta2),
      });
    }

    // Close the browser
  } catch (err) {
    console.error(err);
  }
  await browser.close();
})();
