const axios = require("axios");
const fs = require("fs").promises; // Use promises version of fs

async function seedDatabase() {
  try {
    const data = await fs.readFile("models.json", "utf-8"); // Read file data
    const json = JSON.parse(data); // Convert data to JSON

    for (let make in json.data) {
      // Iterate through each make
      for (let model of json.data[make]) {
        // Iterate through each model in the make
        const payload = {
          make,
          name: model.label,
        };

        // Make the POST request
        const response = await axios.post(
          "http://localhost:3030/models",
          payload
        );
        console.log(
          `Posted ${model.label} under make ${make}, response status: ${response.status}`
        );
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

seedDatabase();
