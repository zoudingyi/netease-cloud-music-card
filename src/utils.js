const axios = require("axios").default;

exports.getBase64 = async function (url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary").toString("base64");
}