
    const { ipcRenderer } = require('electron');
    const BrowserWindow = require('electron').remote.BrowserWindow;
    const path = require('path');
    const url = require('url');
    ipcRenderer.on('waveData', (event, data) => {
        array = data;
        //console.log(data);
    });

    var body, num, array, width, context, logo, myElements, analyser, src, height;

    body = document.querySelector('body');
    num = 32;
    array = new Uint8Array(num*2);
    width = 10;
    //var bodyNode = document.body;
    ipcRenderer.on('editMode', (event,edit) =>{
        var Windows = BrowserWindow.getAllWindows();
        console.log(edit);
        if(edit==false){
        
            body.style.border="none white 1px";
      
            Windows[1].setIgnoreMouseEvents(true);
            Windows[0].setIgnoreMouseEvents(true);
            Windows[0].hide();
        // body.style.border="none";
        }else{
           Windows[1].setIgnoreMouseEvents(false);
            Windows[0].setIgnoreMouseEvents(false);
            Windows[0].show();
            body.style.border="solid white 1px";
            
        }
        });
    for(var i = 0 ; i < num ; i++){
        logo = document.createElement('div');
        logo.className = 'logo';
        logo.style.background = 'red';
        logo.style.minWidth = width +'px';
        logo.style.maxHeight = "calc(100vh - 10px)";
        logo.style.transition = "all 0.2s";
        body.appendChild(logo);
    }

    myElements = document.getElementsByClassName('logo');
    context = new AudioContext();

    /* C МИКРОФНОМ 
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        src = context.createMediaStreamSource(stream);
        loop();
    }).catch(error => {
        alert(error + '\r\n\ ');
        location.reload();
    });
    */ 
    loop(); // Бкз микрофона 

    function loop() {
   
        window.requestAnimationFrame(loop);
      
		let all0 = false;
        if(array.length < num){
            all0 = true;
        }
        for(var i = 0 ;i < num; i++){
            
            if(!all0){
                let abs = array[i] / 1000000000000.0;
                height = abs * 200000000;
            }else{
                height = 0;
            }
            myElements[i].style.height = height+'px';
            myElements[i].style.opacity = 0.08*height;
        }
    }
