const fs = require("fs");
//const Path = require("path");
var data_obj;

var obj = {
  auto_start_flag: "false",
  noty_flag: "false"
};
const { app } = require("electron");
var path = app.getPath("userData");
fs.readFile(path + "/save.json", "utf8", (err, data) => {
  if (err) {
    var a = JSON.stringify(obj);
    fs.writeFile(path + "/save.json", a, err => {
      if (err) {
        console.error(err);
        return;
      }
      fs.readFile(path + "/save.json", "utf8", (err, data) => {
        data_obj = data;
      });

      //файл записан успешно
    });
  } else {
    //console.log(data);
    data_obj = data;
  }
});
function Load() {
  // console.log(data_obj);
  return JSON.parse(data_obj);
}
function setData(data, key, json_obj) {
  json_obj[key] = data;
}
function newKey(data, key, json_obj) {
  json_obj[key] = data;
}
function load_data(key, json_obj) {
  data = json_obj[key];
  return data;
}
function Save(json_obj) {
  var a = JSON.stringify(json_obj);
  // console.log(a);
  //console.log("write");
  fs.writeFile(path + "/save.json", a, err => {
    if (err) {
      console.error(err);
      return;
    }
    //файл записан успешно
    //  console.log("suc");
  });
}
module.exports.Load = Load;
module.exports.Save = Save;
module.exports.setData = setData;
module.exports.load_data = load_data;
module.exports.newKey = newKey;
