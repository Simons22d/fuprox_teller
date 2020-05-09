const { app,BrowserWindow,Menu,shell,Notification,window, ipcMain}  = require ("electron")
// require PATH and FILE
const path = require("path")
const url = require("url")

let mainWindow
let child
const $ = require("jquery")


let template = [
	{
		label: "File",
		submenu: [
			{
				label : "Edit"
			},
			{
				label : "Save"
			}
		]
	},
	{
		label : "Edit",
		submenu : [
			{
				label : "Undo",
				role : "undo",
				accelartor : "CmdOrCtrl+Z"
			}
		]
	}
]


// fixing the default issue with menu 
// navigation menu

if(process.platform === "darwin"){
	// get app name 
	const appName = app.name

	template.unshift({
		label: appName,
		submenu	: [
			{
				label: "Quit",
				click: () => {
					app.quit()
				}
			}
		]
	})

}
const lnk = "index.html";

const createWindow = () =>{
		mainWindow = new BrowserWindow({ 
				height:700,
				width: 1200, 
				minHeight:700,
				minWidth: 1200, 
				show: false,
				webPreferences: {
		            nodeIntegration: true
		        }
			})
	// loading a loading file
	const filePath = url.format({
		pathname: path.join(__dirname, lnk),
		protocol: "file",
		slashes: true
	})

	mainWindow.webContents.loadURL(filePath)
	// displaying content only after it has been displayed
	mainWindow.once("ready-to-show", () => {
		// showing the window onliy after it is ready to show
		mainWindow.show()
	})

	// Open the DevTools.
	mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	child = new BrowserWindow({parent: mainWindow,width:500,height:500})
    child.loadURL(url.format({
        pathname:path.join(__dirname,'login.html'),
        protocol:'file',
        slashes:true,
        webPreferences: {
            nodeIntegration: true
        }
    }))

}

// end create window

app.on("ready",()=>{
	createWindow()
	// bouncing the app icon on certain events 
	// setTimeout(()=>{
	// 	// app.dock.setBadge("1")
	// 	// shell.beep()

	// 	let myNotification = new Notification({
	// 		title :"This is the head",
	// 		body: 'Lorem Ipsum Dolor Sit Amet',
	// 		closeButtonText : "Dismiss",
	// 		actions : {
	// 			type : "button",
	// 			text : "Close"
	// 		}
	// 	})

	// 	// myNotification.onclick = () => {
	// 	// 	console.log('Notification clicked')
	// 	// }

	// 	// myNotification.show();
	// 	// myNotification.on("click",()=>{
	// 	// 	console.log("Notifications clicked by the user.")
	// 	// })

	// 	// noti = notify("Hello", "Hello from the home")
	// 	// console.log(noti)
	// 	// noti.onclick(()=>{
	// 	// 	console.log("notification clicked ...")
	// 	// })
		
	// },5000)


	// setting menu to be started from template 
	const menu = Menu.buildFromTemplate(template)
	// seting it as the application menu
	Menu.setApplicationMenu(menu)
	// re-create the window
	createWindow()

	// app.dock.bounce()
	
	
	// opening the dev tools 
	// child.webContents.openDevTools();

	// listeing for browser close window 
	mainWindow.on("closed",()=>{
		// console.log("closed ... ")
		mainWindow = null
	})
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
	
})


const notify = (title, body) =>{
	let noti = new Notification({
			title : title,
			body : body
			}).show()

	return noti
}


ipcMain.on('entry-accepted', (event, arg) => {
    if(arg=='ping'){
        win.show()
        child.hide()
    }
  })

