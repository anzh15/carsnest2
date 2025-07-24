const fs = require("fs");
const csv = require("csvtojson");

csv()
  .fromFile("cardekho.csv")
  .then((json) => {
    fs.writeFileSync("cardekho.json", JSON.stringify(json, null, 2));
    console.log("✅ Converted to JSON");
  });
