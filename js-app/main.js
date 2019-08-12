const { app, BrowserWindow, Menu, Tray, ipcMain } = require("electron");
const pjson = require("./package.json");
const child_process = require("child_process");
const TrayWindow = require("./index");
const electron = require("electron");
//const notifier = require("electron-notifications");
const Path = require("path");
const fs = require("fs");
const translation = require("./src/language/translate");
const Notification = require("@wuild/electron-notification");

/*
Windwos[0] - ТРЕЙ
Windwow[1] - Окно редактиования
Windows[2+] - Визуалтзаторы
*/
let trayWIN;
let mainWindow;
let Visualizator;
let a;
let child_reader = child_process.spawn("native\\language\\Reader.exe", []);
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
      trayIconPath: Path.join("src/ico/16.png"),
      window: trayWIN
    });

    createWindow();
    createVisualizator();

    //child.stdout.pipe(process.stdout);

    // console.log("wds" + translation.translate_str("edit"));
    var note = new Notification({});
    mainWindow.webContents.send("start_app", "start");
    mainWindow.webContents.send("CreateWindow", " createVisualizator");
    child_reader.stdout.on("data", function(data) {
      lang_data = Buffer.from(Buffer.from(data).toString("utf-8"), "base64");
      a = JSON.parse(lang_data);
      noty_body = translation.translate_str("noty_body", JSON.parse(lang_data));
      noty_title = translation.translate_str(
        "noty_title",
        JSON.parse(lang_data)
      );
      //console.log(translation.translate_str("noty_title", a));
      if (fs.existsSync("./src/flag.txt")) {
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
          fs.writeFile("./src/flag.txt", "true", function(err) {
            if (err) {
              console.log(err);
            } else {
            }
          });
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
  bringWndToFront();

  Visualizator.setIgnoreMouseEvents(true);

  const EventEmitter = require("events");

  let bytesPerSec = false;
  let currentChunk = [];
  let currentVal = [];
  let child = child_process.spawn("native\\AudioPlayBack.exe", []);

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
  trayWIN.webContents.send("lang_data_event", lang_data);
});
