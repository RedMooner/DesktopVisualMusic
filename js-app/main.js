const { app, BrowserWindow, Menu, Tray, ipcMain } = require("electron");
const pjson = require("./package.json");
const child_process = require("child_process");
const TrayWindow = require("./index");
const electron = require("electron");
//const notifier = require("electron-notifications");
const Path = require("path");
const fs = require("fs");
const translation = require("./src/language/translate");
const save = require("./src/save_system/Save");
const Notification = require("@wuild/electron-notification");
var AutoLaunch = require("auto-launch");
var pos;
/*
Windwos[0] - ТРЕЙ
Windwow[1] - Окно редактиования
Windows[2+] - Визуалтзаторы
*/
let trayWIN;
let mainWindow;
let Visualizator;
let a;
var lang_data;
var noty_title;
var noty_body;
const gotTheLock = app.requestSingleInstanceLock(); //to make only one instance
var edit = false;
let bringWndToFront = () => {
  // mainWindow.setAlwaysOnTop(true);
  //  setTimeout(()=>{mainWindow.setAlwaysOnTop(false)},100);
};

//looking for instance
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  initApp();
}

//initialize app

function initApp() {
  // checking first launch

  //
  app.on("ready", () => {
    trayWIN = new BrowserWindow({
      width: 340,
      height: 380,
      show: false,
      fullscreenable: false,
      frame: false,
      resizable: false,
      useContentSize: true,
      alwaysOnTop: true,
      transparent: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true
      }
    });
    trayWIN.loadURL(`file://${Path.join(__dirname, "src/Tray.html")}`);
    TrayWindow.setOptions({
      trayIconPath: Path.join(__dirname, "16.png"),
      window: trayWIN
    });

    createWindow();
    createVisualizator();

    //child.stdout.pipe(process.stdout);

    // console.log("wds" + translation.translate_str("edit"));
    var note = new Notification({});
    mainWindow.webContents.send("start_app", "start");
    mainWindow.webContents.send("CreateWindow", " createVisualizator");

    let path = require("path");
    let relreadpath = "\\native\\language\\Reader.exe";
    let basereadpath = path.dirname(__dirname);
    let filereadpath = basereadpath + relreadpath;

    if (!fs.existsSync(filereadpath)) {
      filereadpath = __dirname + relreadpath;
    }

    let child_reader = child_process.spawn(filereadpath, []);

    child_reader.stdout.on("data", function(data) {
      if (data != "err") {
        lang_data = Buffer.from(Buffer.from(data).toString("utf-8"), "base64");
        a = JSON.parse(lang_data);
        console.log(a);
        console.log("READER");
        noty_body = translation.translate_str(
          "noty_body",
          JSON.parse(lang_data)
        );
        noty_title = translation.translate_str(
          "noty_title",
          JSON.parse(lang_data)
        );
      } else {
        noty_body = "ENG";
        noty_title = "ENG";
        lang_data = "err";
      }
      //console.log(translation.translate_str("noty_title", a));
      var Saves = save.Load();
      var flag = save.load_data("noty_flag", Saves);
      var auto_flag = save.load_data("auto_start_flag", Saves);
      console.log(flag);
      var win_x = save.load_data("win_x", Saves);
      var win_y = save.load_data("win_y", Saves);
      console.log(win_x + "эОО ИКс да ладно");
      Visualizator.setPosition(win_x, win_y);
      if (flag == "true") {
      } else {
        note = new Notification({
          theme: "dark",
          title: noty_title,
          body: noty_body,
          position: "bottom-right"
        });

        note.show();
        trayWIN.on("show", function() {
          console.log("hide");
          note.close();
          save.setData("true", "noty_flag", Saves);
          console.log(Saves);
          save.Save(Saves);
        });
      }
    });
    //  let a = JSON.parse(lang_data);

    mainWindow.hide();
    mainWindow.setAlwaysOnTop(true, "floating", 1);
    Visualizator.setAlwaysOnTop(true);

    // lang_data = JSON.parse(lang_data);
  });
  app.on("window-all-closed", function() {
    // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      //     app.quit()
    }
  });

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });

  app.on("before-quit", () => (app.quitting = true));
  //
}

//on app initialized, create app
function createVisualizator() {
  let canHide = true;

  // Create the browser window.
  Visualizator = new BrowserWindow({
    width: 500,
    height: 200,
    minWidth: 300,
    minHeight: 250,
    skipTaskbar: true,
    parent: mainWindow,
    resizable: true,
    transparent: true,
    frame: false,
    icon: __dirname + "./src/ico/32.png",
    webPreferences: {
      nodeIntegration: true
    }

    //titleBarStyle: 'customButtonsOnHover',
    //frame: false,
    //transparent: true,
    //skipTaskbar: true //TO FROM BOTTOM TASK PANEL
  });

  if (process.platform === "darwin") {
    app.dock.hide(); // TO FROM BOTTOM TASK PANEL MacOS
  }
  Visualizator.loadFile("src/Visualizator.html");
  Visualizator.on("closed", function() {
    Visualizator = null;
  });
  Visualizator.on("move", function() {
    var obj = save.Load();
    pos = Visualizator.getPosition();
    save.setData(pos[0], "win_x", obj);
    save.setData(pos[1], "win_y", obj);
    save.Save(obj);
  });
  bringWndToFront();

  Visualizator.setIgnoreMouseEvents(true);

  const EventEmitter = require("events");

  let bytesPerSec = false;
  let currentChunk = [];
  let currentVal = [];

  let path = require("path");
  let relreadpath = "\\native\\AudioPlayBack.exe";
  let basereadpath = path.dirname(__dirname);
  let filereadpath = basereadpath + relreadpath;

  if (!fs.existsSync(filereadpath)) {
    filereadpath = __dirname + relreadpath;
  }

  let child = child_process.spawn(filereadpath, []);

  child.stdout.on("data", function(data) {
    //currentChunk = [];
    let out = data.toString();

    //сюда приходят из c# данные с Console.Write
    //так же первые данные это информация

    for (let i = 0; i < out.length; i++) {
      if (out[i] === ",") {
        currentChunk.push(parseArrToInt(currentVal));
        currentVal = [];
      } else if (out[i] === "\n") {
        currentChunk.push(parseArrToInt(currentVal));
        currentVal = [];

        if (currentChunk.length === 0 && currentVal.length > 0) {
          currentChunk = currentVal;
        }

        if (!bytesPerSec) {
          bytesPerSec = parseArrToInt(currentChunk);
        } else if (Visualizator) {
          Visualizator.webContents.send("waveData", currentChunk);
          //console.log(currentChunk);
        }

        currentChunk = [];
      } else {
        currentVal.push(out[i]);
      }
    }

    //console.log(out + "end");
    //console.log(currentChunk);
  });

  child.stderr.on("data", function(data) {
    console.log("stderr: " + data);
  });

  child.on("close", function(code) {
    console.log("child process exited with code " + code);
  });
}
function createWindow() {
  let canHide = true;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 200,
    minWidth: 300,
    minHeight: 250,
    skipTaskbar: true,
    resizable: false,
    //  opacity:1,

    fullscreen: true,
    transparent: true,
    frame: false,
    icon: __dirname + "/icon.png",
    webPreferences: {
      nodeIntegration: true
    }

    //titleBarStyle: 'customButtonsOnHover',
    //frame: false,
    //transparent: true,
    //skipTaskbar: true //TO FROM BOTTOM TASK PANEL
  });

  if (process.platform === "darwin") {
    app.dock.hide(); // TO FROM BOTTOM TASK PANEL MacOS
  }
  mainWindow.loadFile("src/MainWindow.html");
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
  bringWndToFront();

  mainWindow.setIgnoreMouseEvents(true);
  //  mainWindow.maximize();
}

function parseArrToInt(arr) {
  let i = 0;
  let t = 1;
  for (let j = arr.length - 1; j >= 0; j--) {
    i += arr[j] * t;
    t *= 10;
  }
  return i;
}
function parseInteger(x) {
  let parsed = parseInt(x);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

ipcMain.on("close_app", (event, args) => {
  console.log(args);
  app.exit();
});
ipcMain.on("Add_Vis", (event, args) => {
  console.log(args);
  createVisualizator();
});
ipcMain.on("tray_start", (event, args) => {
  var Saves = save.Load();
  // var flag = save.load_data("noty_flag", Saves);
  var auto_flag = save.load_data("auto_start_flag", Saves);

  trayWIN.webContents.send("checkbox", auto_flag);
  trayWIN.webContents.send("lang_data_event", lang_data);
});
ipcMain.on("auto_enable", (event, args) => {
  var AutoLauncher = new AutoLaunch({
    name: "DVM"
  });
  if (args == "enable") {
    AutoLauncher.enable();
  } else {
    AutoLauncher.disable();
  }
});
