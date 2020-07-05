const { app,BrowserWindow,ipcMain,Menu } = require('electron')
const path=require('path')
const url=require('url')

let teller = 1;
let branch_id = 2;

let win;
let token;

function createWindows() {
    win = new BrowserWindow({
                height:800,
                width: 1300, 
                minHeight:700,
                minWidth: 1200,
                autoHideMenuBar  : true,
                webPreferences: {
                    enableRemoteModule: true
                }
    })
    app.allowRendererProcessReuse = true;
    // autoHideMenuBar  : true,

    // win.webContents.openDevTools()

    win.loadURL(url.format({
        pathname:path.join(__dirname,'index.html'),
        protocol:'file',
        slashes:true,
         webPreferences: {
            nodeIntegration: true
        }
    }))
    win.setMenu(null)

    // win.setFullScreen(true)
    win.setTitle("Fuprox Teller Two")
}

app.on('ready',() =>{
    createWindows();
});

