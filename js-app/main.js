const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const pjson = require('./package.json');
const child_process = require('child_process');
    


const Path = require('path');
const fs = require('fs');



//var Visualizator_file = require('./src/js/propertys');
let tray = null
let mainWindow;
let Visualizator;
const gotTheLock = app.requestSingleInstanceLock();//to make only one instance
var edit = false;
let bringWndToFront = ()=>{
   // mainWindow.setAlwaysOnTop(true);
  //  setTimeout(()=>{mainWindow.setAlwaysOnTop(false)},100);
};

//looking for instance
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
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
  
    app.on('ready',()=>{
        tray = new Tray('src/inbox.png')
     
        const contextMenu = Menu.buildFromTemplate([

            { label: 'Edit', type: 'normal', click: function(){
                   Visualizator.webContents.send("editMode", true);
            } },
            { label: 'Settings', type: 'normal' },
            { label: 'Exit', type: 'normal' ,click: function(){
                app.quit()
            } }
          ])
          tray.setToolTip('DesktopVisualMedia')
          tray.setContextMenu(contextMenu)
          
        createWindow();
        createVisualizator();
        mainWindow.webContents.send("CreateWindow" ," createVisualizator");
        mainWindow.hide();
        mainWindow.setAlwaysOnTop(true, "floating", 1);
        Visualizator.setAlwaysOnTop(true);
        

     
      
    });
    app.on('window-all-closed', function () {
        // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
       //     app.quit()
          
        }
    });

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow();
        } else {
            mainWindow.show();
        }

    });

    app.on('before-quit', () => app.quitting = true);
}

//on app initialized, create app
function createVisualizator(){
    let canHide = true;
  
    // Create the browser window.
    Visualizator = new BrowserWindow({
        width: 500,
        height: 200,
        minWidth: 300,
        minHeight: 250,
        skipTaskbar: true,
        parent:mainWindow,
        resizable:true,
        transparent: true, frame: false ,
        icon: __dirname + '/icon.png',
        webPreferences: {
            nodeIntegration: true
        
        },

        //titleBarStyle: 'customButtonsOnHover',
        //frame: false,
        //transparent: true,
        //skipTaskbar: true //TO FROM BOTTOM TASK PANEL
    });
  
    if (process.platform === 'darwin') {
        app.dock.hide(); // TO FROM BOTTOM TASK PANEL MacOS
    }
    Visualizator.loadFile('src/Visualizator.html');
    Visualizator.on('closed', function () {
        Visualizator = null;
    });
    bringWndToFront();
   
    Visualizator.setIgnoreMouseEvents(true);
 
    const EventEmitter = require('events');

    let bytesPerSec = false;
    let currentChunk = [];
    let currentVal = [];
    let child = child_process.spawn("native\\AudioPlayBack.exe", []);

    //child.stdout.pipe(process.stdout);

    child.stdout.on('data', function (data) {
        //currentChunk = [];
        let out = data.toString();

        //сюда приходят из c# данные с Console.Write
        //так же первые данные это информация

        for(let i = 0;i<out.length;i++){
            if(out[i] === ","){
                currentChunk.push(parseArrToInt(currentVal));
                currentVal = [];
            }else if(out[i]==="\n"){
                currentChunk.push(parseArrToInt(currentVal));
                currentVal = [];

                if(currentChunk.length === 0 && currentVal.length > 0){
                    currentChunk = currentVal;
                }

                if(!bytesPerSec){
                    bytesPerSec = parseArrToInt(currentChunk);
                }else if(Visualizator){
                    Visualizator.webContents.send("waveData",currentChunk);
                    //console.log(currentChunk);
                }

                currentChunk = [];

            }else{
                currentVal.push(out[i]);
            }
        }


        //console.log(out + "end");
        //console.log(currentChunk);
    });

    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    child.on('close', function (code) {
        console.log('child process exited with code ' + code);
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
        resizable:false,
      //  opacity:1,
        fullscreen:true,
        setIgnoreMouseEvents:true,
        transparent: true, frame: false ,
        icon: __dirname + '/icon.png',
        webPreferences: {
            nodeIntegration: true
        
        },

        //titleBarStyle: 'customButtonsOnHover',
        //frame: false,
        //transparent: true,
        //skipTaskbar: true //TO FROM BOTTOM TASK PANEL
    });
  
    if (process.platform === 'darwin') {
        app.dock.hide(); // TO FROM BOTTOM TASK PANEL MacOS
    }
    mainWindow.loadFile('src/MainWindow.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    bringWndToFront();
   
    mainWindow.setIgnoreMouseEvents(true);
  
}

function parseArrToInt(arr) {
    let i = 0;
    let t = 1;
    for(let j = arr.length-1;j>=0;j--){
        i+= arr[j] * t;
        t *= 10;
    }
    return i;
}
function parseInteger(x) {
    let parsed = parseInt(x);
    if (isNaN(parsed)) { return 0 }
    return parsed;
}
