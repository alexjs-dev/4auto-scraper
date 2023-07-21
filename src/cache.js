const Cache = require("file-system-cache").default;

const cache = Cache({
  basePath: ".cache",
  ns: "cache",
});

module.exports = cache;
