const selectors = require("./selectors");
const { modelTags } = require("./tags");

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
  // example input "EUR 14,500"
  // example output { currency: "EUR", price: 14500, discountedPrice: "" }
  // replace &nbsp with space
  priceString = priceString?.replace(/\u00a0/g, " ") || "";
  discountedPriceString = discountedPriceString?.replace(/\u00a0/g, " ") || "";
  const [currency, price] = priceString.split(" ");
  const [currencyDiscounted, discountedPrice] =
    discountedPriceString.split(" ");
  const priceWithoutComma = price?.replace(",", "") || "";
  const discountedPriceWithoutComma = discountedPrice?.replace(",", "") || "";
  return {
    currency: currency || currencyDiscounted || "EUR",
    price: parseInt(priceWithoutComma || discountedPriceWithoutComma || 0),
    discountedPrice:
      (discountedPriceWithoutComma && parseInt(discountedPriceWithoutComma)) ||
      "",
  };
};

const getIdFromHref = (href) => {
  // example input: https://eng.auto24.ee/vehicles/3798686
  // example output: 3798686
  return href.split("/").pop();
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

  const capacity = engineString.split(" ")?.[0];
  // find string that has kW
  const power = engineString.match(/\d+kW/)?.[0];
  const meta = engineString.replace(capacity, "").replace(power, "").trim();
  return {
    capacity: parseInt(capacity) * 1000 || 0,
    power: parseInt(power) || 0,
    meta,
  };
};

const normalizeDriveTrain = (driveTrainString) => {
  const driveTrainMapping = {
    "rear-wheel drive": "rearWheel",
    "front-wheel drive": "frontWheel",
    "four-wheel drive": "fourWheel",
  };
  return driveTrainMapping[driveTrainString] || "frontWheel";
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

const getLangUrl = (url, lang) => {
  if (lang === "ru") {
    return url.replace("eng", "rus");
  }
  if (lang === "ee") {
    return url.replace("eng.", "");
  }
  return url;
};

const getCountry = (location) => {
  // Kohtla-Järve, Estonia -> Estonia
  // Tallinn, Estonia -> Estonia
  if (location.includes(",")) {
    return location.split(",")[1].trim();
  }
  return location.split(":")[1].trim();
};

const formatRegDate = (regDateString) => {
  if (!regDateString.includes("/")) {
    return `01/${regDateString}`;
  }
  return regDateString;
};

const normalizeModel = (modelString) => {
  // check if contains space and second word is a number
  const isNumberedModel =
    modelString.includes(" ") && !isNaN(modelString.split(" ")[1]);
  if (isNumberedModel) {
    // // E 220 -> E220
    return modelString.replace(" ", "");
  }
  return modelString;
};

const getTags = (vehicleModel, vehicleMake, parsedEngine, title) => {
  let make = "";
  const tags = new Set();
  if (
    vehicleMake?.toLowerCase().includes("merc") ||
    vehicleMake?.toLowerCase().includes("benz")
  ) {
    make = "mercedes";
  }
  if (vehicleMake?.toLowerCase().includes("bmw")) {
    make = "bmw";
  }
  if (vehicleMake?.toLowerCase().includes("audi")) {
    make = "audi";
  }

  if (make) {
    const models = modelTags[make];
    const tagModel = Object.keys(models).find((tag) => {
      // starts with
      return vehicleModel?.toLowerCase().startsWith(tag);
    });
    if (tagModel) {
      const tagsArray = models[tagModel];
      tagsArray.forEach((tag) => tags.add(tag));
    }
    if (parsedEngine?.power > 210 && !tags.has("sport")) {
      tags.add("sport");
    }
    if (make === "mercedes" && title?.toLowerCase().includes("amg")) {
      tags.add("amg");
      tags.add("luxury");
    }
    if (make === "bmw" && title?.toLowerCase().includes("m")) {
      tags.add("m-series");
      tags.add("sport");
    }
    if (make === "audi" && title?.toLowerCase().includes("s-line")) {
      tags.add("s-line");
      tags.add("sport");
    }

    // return tags as array
    return Array.from(tags);
  }
};

// sample:
// `Seats:  5
// Number of doors:        4
// Length: 5127 mm
// Width:  1899 mm
// Height: 1456 mm
// FUEL
// Fuel:   diesel
// Fuel consumption in a city:     9.6 l/100 km
// Fuel consumption on a freeway:  5.6 l/100 km
// Fuel consumption average:       7 l/100 km
// AXLES`

const getConsumption = (techData, type) => {
  try {
    // find string after :, that has l/100 km, that has
    // "Fuel consumption in a city:     9.6 l/100 km"
    const column = techData.match(
      type === "city"
        ? /Fuel consumption in a city:.*[0-9].[0-9]/
        : type === "highway"
        ? /Fuel consumption on a freeway:.*[0-9].[0-9]/ ||
          /Fuel consumption average:.*[0-9].[0-9]/
        : /Fuel consumption average:.*[0-9].[0-9]/
    )?.[0];
    // Fuel consumption in a city:       9.6 l/100 => 9.6
    const field = column?.split(":")[1]?.trim();
    const value = field?.split(" ")[0];
    return value ? parseFloat(value) : 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
};

const getBaseData = async (page) => {
  const bodyType = await getItemData(page, selectors.bodyType);
  const engine = await getItemData(page, selectors.engine);
  const fuel = await getItemData(page, selectors.fuel);
  const mileage = await getItemData(page, selectors.mileage);
  const driveTrain = await getItemData(page, selectors.driveTrain);
  const transmission = await getItemData(page, selectors.transmission);
  const price = await getItemData(page, selectors.price);
  const priceDiscounted = await getItemData(page, selectors.priceDiscounted);
  const regDate = await getItemData(page, selectors.regDate);
  const mainImage = await getHref(page, selectors.mainImage);
  const galleryImages = await getHrefArray(page, selectors.galleryImages);
  const description = await getItemData(page, selectors.description);
  const techData = await getItemData(page, selectors.techData);

  const avgCityFuelCons = getConsumption(techData, "city");
  const avgHwFuelCons = getConsumption(techData, "highway");
  const avgCombFuelCons = getConsumption(techData, "average");

  const vehicleMake = await getItemData(page, selectors.vehicleMake);
  const vehicleModel = await getItemData(page, selectors.vehicleModel);
  const originalTitle = await getItemData(page, selectors.originalTitle);
  const city = (await getItemData(page, selectors.citySelector)) || "Tallinn";
  const location = await getItemData(page, selectors.locationSelector);
  const country = getCountry(location) || "Estonia";
  const parsedEngine = parseEngine(engine);
  const tags = getTags(vehicleModel, vehicleMake, parsedEngine, originalTitle);
  const normalizedModel = normalizeModel(vehicleModel);
  return {
    city,
    country,
    tags,
    vehicleMake: vehicleMake.toLowerCase() || "",
    vehicleModel: normalizedModel?.toLowerCase() || "",
    title: originalTitle || "",
    bodyType: bodyType.toLowerCase(),
    engine: parsedEngine,
    fuel: normalizeFuel(fuel),
    mileage: parseMileage(mileage) || 0,
    driveTrain: normalizeDriveTrain(driveTrain),
    transmission: normalizeTransmission(transmission) || "",
    price: parsePrice(price, priceDiscounted),
    regDate: formatRegDate(regDate),
    mainImage,
    galleryImages,
    description,
    avgCityFuelCons,
    avgHwFuelCons,
    avgCombFuelCons,
  };
};

module.exports = {
  getBaseData,
  getHref,
  getHrefArray,
  getIdFromHref,
  getHtmlAsText,
  getItemData,
  getLangUrl,
  parseEngine,
  parseMileage,
  parsePrice,
  escapeDangerousHtml,
  normalizeDriveTrain,
  normalizeFuel,
  normalizeTransmission,
};
