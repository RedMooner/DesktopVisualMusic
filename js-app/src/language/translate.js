let translate_obj; // Хрант перевод;
let standart_language = "eng"; // Стандартный язык (по умолчанию английский)
const fs = require("fs");
const Path = require("path");
var chardet = require("chardet");
function outPut() {
  console.log(JSON.stringify(translate_obj));
}
//jsonObject = require(Path.join("file:///" + __dirname + "/" + "ru.json"));
function check_translate(data) {
  // Проверяет если ли файл с переводом
  //Принимает параметр path - путь до файла с переводом .json
  // read (d)"file " ,

  translate_obj = JSON.parse(data);

  // console.log(translate("edit"));

  //console.log(translate_str("edit"));
  //localStorage.setItem("local", translate_obj);
}
function translate_tag(tag, key) {
  //Переводит выбраный тег
  // Принимает параметр tag (конкретный тыег для перевода)
}
function translate_str(key, json_obj) {
  //translate_obj = localStorage.getItem("local");
  //translate_obj = JSON.parse(translate_obj);

  var data = "";
  data = json_obj[key];
  //console.log(data);
  return data;
}
function translate_all(tags) {
  tags[0].innerHTML = "Новая ссылка";
}
module.exports.check_translate = check_translate;
module.exports.translate_tag = translate_tag;
module.exports.translate_str = translate_str;
module.exports.translate_obj = translate_obj;
