const ipc = require('electron').ipcRenderer;


const asyncMsgBtn = document.getElementById('new')

asyncMsgBtn.addEventListener('click', () => {
  ipcRenderer.send('asynchronous-message', 'ping')
  console.log("new issues")
})



var btn_login = document.getElementById("btn-login");
btn_login.addEventListener("click",()=>{
	console.log("login btn clicked")
	let email = $("#email").val()
	let password = $("#password").val()
	console.log(email,password)
})

// console.log("login btn clicked")
// 	let email = $("#email").val()
// 	let password = $("#password").val()
// 	console.log(email.length,password.length);
// 	// if(email && password){
// 	// 	console.log("final ...")
// 	// 	ipc.sendSync('entry-accepted', 'ping')
// 	// }else{
// 	// 	console.log("working progress ...")
// 	// }