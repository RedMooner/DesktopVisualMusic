const fs = require("fs");
const Path = require("path");
function Load() {
  fs.readFile(__dirname + "/save.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data.toString());
  });
}

module.exports.Load = Load;
