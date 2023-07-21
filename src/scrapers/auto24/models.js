const MAKES = [
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroen",
  "Dacia",
  "Dodge",
  "Ferrari",
  "Fiat",
  "Ford",
  "Genesis",
  "Honda",
  "Hummer",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lada",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-AMG",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Moskvich",
  "Mustang",
  "Nissan",
  "Opel",
  "Peugeot",
  "Polestar",
  "Porsche",
  "Ram",
  "Renault",
  "Rolls-Royce",
  "Rover",
  "Saab",
  "SEAT",
  "Skoda",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const URL = "https://eng.auto24.ee/";
const AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/78.0.3904.108 Safari/537.36";
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");

const SELECTORS = {
  MAKE_SELECT:
    "#item-searchParam-cmm-1-make > div > div > div.select-selected.no-selection",
  MAKE_LIST:
    "#item-searchParam-cmm-1-make > div > div > div.select-items-container > div",
};

const getModelApiUrl = (makeId) => {
  return `https://eng.auto24.ee/services/data_json.php?q=models&existonly=true&parent=${makeId}&type=100`;
};

const getModels = async (makeId) => {
  if (!makeId) {
    throw new Error("makeId is required");
  }
  const url = getModelApiUrl(makeId);

  const filterSeries = (array) => {
    // remove all entries that have children defined: // [label, value, children?]
    return array.filter(({ children }) => !children);
  };

  // make api fetch
  // result -> q.response[] -> {value, label}
  // return result
  const response = await axios.get(url);
  const data = response.data?.q?.response || []; // [label, value, children?]
  return filterSeries(data);
};

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(AGENT);
    await page.goto(URL);

    // Click on the make select
    await page.waitForSelector(SELECTORS.MAKE_SELECT);
    await page.click(SELECTORS.MAKE_SELECT);

    // Get a list of all the makes
    await page.waitForSelector(SELECTORS.MAKE_LIST);

    // Log them
    const makes = await page.$$eval(
      "select option",
      (options, MAKES) => {
        return options
          .map((option) => ({
            make: option.textContent,
            dataValue: option.value,
          }))
          .filter((option) => MAKES.includes(option.make));
      },
      MAKES
    );

    const uniqueMakes = _.uniqBy(makes, "make");
    console.log("count", uniqueMakes.length);

    // Generate JSON
    let carData = {};

    for (let make of makes) {
      const id = make.dataValue;
      const name = make.make;
      const makeData = await getModels(id); // returns [{label, value}]

      carData[name] = makeData; // storing the make data into object with make name as the key

      console.log(`Processed: ${name}`);

      // sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // write the whole JSON to the file at the end with root "data" key
    fs.writeFile("models.json", JSON.stringify({ data: carData }), (err) => {
      if (err) throw err;
      console.log("All data saved to models.json!");
    });
  } catch (err) {
    console.error(err);
  }
  await browser.close();
})();
