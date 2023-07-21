const fs = require("fs");
const axios = require("axios");

const downloadImage = async (url) => {
  // download image from url and save it to the local file system
  const response = await axios({
    method: "GET",
    url,
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data, "utf-8");
  const fileName = url.split("/").pop();
  fs.writeFile(`./images/${fileName}`, buffer, () =>
    console.log("finished downloading image: ", fileName)
  );
};

module.exports = downloadImage;
