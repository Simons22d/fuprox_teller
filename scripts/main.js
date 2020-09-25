let country_id = 1;
let link = "http://127.0.0.1:1000"
let teller = localStorage.getItem("tellerNumber")
let branch_id;
try {
  branch_id = JSON.parse(localStorage.getItem("branch_info")).msg.id
}
catch(error) {
	branch_id = 2 || 1
}

let online_status = $(".status");
let text_status = $(".status_text");

$("#tellerNumber").html(teller)

$("#set_teller_number").on("click",()=>{
	let teller_number = $("#teller_number").val()
	getData(`${link}/teller/exists`,"POST",{"teller":teller_number,"branch_id" :branch_id},(data)=>{
		let count = 0;
		for(x in data){count++;}
		if(count){
			console.log(data)
			if(teller_number){
				if(Number(teller_number)){
					localStorage.setItem("tellerNumber",Number(teller_number))
					$("#message_teller").html(`<div class="alert alert-success" role="alert">Success Changing Teller. Make sure to restart app.<br> for changes to take effect</div>`)
				}else{
					$("#message_teller").html(`<div class="alert alert-danger" role="alert">Error must be a number.</div>`)
				}
			}
		}else{
			$("#message_teller").html(`<div class="alert alert-danger" role="alert">Teller Does Not Exist.</div>`)
		}
	})
})

// $("#sync_service").on("click",(e)=>{
// 	sync()
// })

const getData = (url,methods,data,handle) => {
	fetch(url,{
	  method: methods,
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(data)
	})
	.then(res=>res.json())
	.then(res => handle(res));
};

setTimeout(()=>{
	let key = localStorage.getItem("key")
	getData(`${link}/branch/by/key`,"POST",{"key" : key},(data)=>{
		if(data.status){
			$("#branch").html(data.msg.name)
			$("#date").html(new Date())
		}else{
			$("#branch").html("——")
		}
	})
},10)


 const sync = () => {
	 $("#loading_gif").show()
	 getData(`${link}/sync/all/offline`,"POST",{"key" : JSON.parse(localStorage.getItem("branch_info")).msg.key_},(data)=>{
		 //  perform some UI manipulations
		 if(data){
			 setTimeout(()=>{
				 $("#loading_gif").hide()
				 $("#message_sync").html(`<div class="alert alert-success" role="alert">Successfully Updated data</div>`)
			 },20000)
		 }else{
			 // we are not geting the response
			 $("#message_sync").html(`<div class="alert alert-danger" role="alert">Error! Could NotUpdated data</div>`)
		 }
	 })
 }


// getting the local storage key
if(localStorage.getItem("key")){
	//gettingthe key info
	let key = localStorage.getItem("key").trim()
	if (key.length !== 64){
		//	 there is an issue with the key
		$("#key").attr("placeholder","Activation Key Error!")
		$("#key").addClass("is-invalid")
		$("#verifyKey").prop("disabled",false)
		$("#key").removeClass("is-invalid")
	}else{
		//	key is valid
		$("#key").attr("placeholder",key)
		$("#verifyKey").prop("disabled",true)
	}
}else{
//	no key
}

$("#key").on("input",(e)=>{
	$("#verifyKey").prop("disabled",false)
})


const verifyKey = (key) => {
	getData(`${link}/branch/by/key`,"POST",{"key" : key},(data)=>{
		if (data.status){
			// #store key in localStorage
			$("#message_key").html(`<div class="alert alert-success" role="alert">Valid Key</div>`)
			localStorage.setItem("key",key)
			localStorage.setItem("branch_info",JSON.stringify(data))
			$("#verifyKey").prop("disabled",true)
			$("#key").removeClass("is-invalid")
		}else{
			// key not valid
			// replace dowm with on invalid key
			$("#message_key").html(`<div class="alert alert-danger" role="alert">Key Is Not Valid</div>`)
			$("#key").addClass("is-invalid")
		}
	})
}

$("#verifyKey").on("click",()=>{
	let key = $("#key").val()
	if(key) {
	//	message_key
		verifyKey(key)
	}else {
		$("#message_key").html(`<div class="alert alert-danger" role="alert">Key cannot Be empty</div>`)
	}
})


// get branch icons
const updateIcons = () =>{
getData(`${link}/service/icons/get`,"POST",{"branch_id":branch_id} ,(data)=>{

	if(data){
		let handle = $("#icon_id")
		let final  = ""
		data.map((item,index)=>{
			let spl = item.name.split(" ");
			let king = item.name.split(" ").length > 1 ? `${spl[0]}_${spl[1]}` : item.name ;
			final += `<option id="option_${king}" attr-id="${item.id}">${item.name}</option>`
		})
		handle.html(final)
	}
})
}


updateIcons()

const updateServices =() =>{
getData(`${link}/services/branch/get`,"POST",{"branch_id":branch_id},(data)=>{
let handle = $("#service_to_offer")
let final  = ""
	data.map((item,index)=>{
		final += `<option id="${item.id}">${item.name}-${item.code}</option>`
	})
	handle.html(final)
handle.html(final)
})
}

updateServices()


function readURL(input) {
if (input.files && input.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		icon_data = reader.result
	}
	reader.readAsDataURL(input.files[0]); // convert to base64 string
	}
}

const play = (string) =>{
        $.speech({
            key: '5d575f97089243ac8be10fb4ce96bf74',
            src: string,
            hl: 'en-gb',
            r: 0,
            c: 'mp3',
            f: '44khz_16bit_stereo',
            ssml: false
		});
};


const getActive = (call=12) => {
		getData(`${link}/get/active/ticket`,"POST",{"teller_id":teller,"branch_id" : branch_id},(data)=>{
		let final = "";
		let count = 0;
		for(x in data){count++;}
		if(count){

			// start
			// end

			$("#this_comment").show()
			let fowarded = data.forwarded ? "Fowarded" : "Not Fowarded"
			let is_instant = data.is_instant ? `<span href=\"#\" class=\"badge badge-info\" style="font-size:12px">Insant</span>` : `<span href=\"#\" class=\"badge badge-dark\" style="font-size:12px">Not Insant</span>`
			if (data.is_medical && data.user || data.user && !data.is_instant){
				is_instant = `<span href=\"#\" class=\"badge badge-success\" style="font-size:12px">Online</span>`
			}
			getComments(data.id)
			let service_name = data.service_name
				$("#booking_type").html(is_instant)
				$("#ticket_type").html(service_name)
				$("#fowarded").html(fowarded)
				sessionStorage.setItem("active_ticket",data['id'])
			final += `${data.ticket}`;
			if (call ===120 ){
				// testing 
				console.log("testing ... ")
				let handle = $("#nxtTicket")
				handle.prop("disabled",true)
				// play(data.caller)
				let caller = data.caller
				getData(`${link}/callout`,"POST",{"phrase" : caller},(data)=>{
					if(data){
					//	enable button else
						handle.prop("disabled",false)
					}
				})
			}
		}else {
			final += '——'
		}
		$("#activeTicket").html(final)
	})
};

const getAll = () => {
		getData(`${link}/tellers/get/all`,"POST",{"branch_id":branch_id},(tellers)=>{
		let final =" "
		tellers.map((data,index)=>{
			if(Number(data.number) === Number(localStorage.getItem("tellerNumber"))){

			}else{
				final += `<a class="dropdown-item"  onclick="getTellerInfo(this)" class="tellers" id="${data.number}">Teller ${data.number} - ${data.service}</a>`
			}
		})
		$("#tellerOptions").html(final)
	})
};


const getNext = () =>{
		// next ticket
	getData(`${link}/get/next/ticket`,"POST",{"teller_id":teller,"branch_id" : branch_id},(data)=>{
		let final ="";
		let count = 0;
		for(x in data){count++;}
		if(count){
			final += `${data.ticket}`
		}else{
			final += `——`
		}
		$("#nextTicket").html(final)
	})
};


const getUpcoming = () =>{
	let mapper = ["","bookingOne","bookingTwo","bookingThree","bookingFour","bookingFive"]
	getData(`${link}/get/upcoming/tickets`,"POST",{"teller_id":teller,"branch_id":branch_id},(data)=>{
		if(data.length === 4){
			$("#bookingFive").html("—")
			$("#bookingFour").html("—")
		}else if(data.length === 3){
			$("#bookingFive").html("—")
			$("#bookingFour").html("—")
			$("#bookingThree").html("—")
		}else if(data.length === 2){
			$("#bookingFive").html("—")
			$("#bookingFour").html("—")
			$("#bookingThree").html("—")
			$("#bookingTwo").html("—")
		}else if(data.length === 1){
			$("#bookingFive").html("—")
			$("#bookingFour").html("—")
			$("#bookingThree").html("—")
			$("#bookingTwo").html("—")
			$("#bookingOne").html("—")
		}

		if(data.length){
			if(data.length){
				data.map((data,index)=>{
					if(index === 0){


					}else{
						data_ticket = data.ticket ? data.ticket : "—"
						$(`#${mapper[index]}`).html(`${data_ticket}`)
					}
				})
				// console.log("number of tickets",data.length)

			}
		}else {
			final = null
		}
	})
};

$(function() {
	// let	handle = $("#services")
	getUpcoming()
	getNext()
	getActive()
	getAll()
});

const getTellerInfo = (me) => {
	let this_id = me.id
	let comment = $("#this_comment").val()  ? $("#this_comment").val().trim() : "—"
	// here we are going to foward the ticket
	getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":this_id,"comment" :comment},(data)=>{
		getUpcoming();
		getNext();
		getAll();
		$("#booking_type").html("—");
		$("#ticket_type").html("—");
		$("#fowarded").html("—");
		$("#activeTicket").html("—");
		$("#this_comment").val("")
		$('#this_comment').hide()
	})
};

const nextTicket = () => {
	getData(`${link}/ticket/service`,"POST",{"teller_id" : teller,"branch_id":branch_id},(data)=>{
		getUpcoming();
		getNext();
		getActive(120);
		getAll();
	})
};

const closeTicket = () =>{
	sessionStorage.getItem("active_ticket")
	getData(`${link}/ticket/close`,"POST",{"teller_id" : teller},(data)=>{
		$('#this_comment').hide()
		getUpcoming();
		getNext();
		getAll();
		$("#booking_type").html("—")
		$("#ticket_type").html("—")
		$("#fowarded").html("—")
		$("#activeTicket").html("—")
	})
};

// setInterval(()=>{
// 		getUpcoming();
// 		getNext();
// 		getActive();
// 		getAll();
// },1000);

// setInterval(()=>{
// 	sync()
// },60000)


$("#settings").on("click",()=>{
	$("#myModal").show()
});

$(".close").on("click",()=>{
	$("#myModal").hide()
});


$("#moreInfo").on("click",(me)=>{
	let key  = $("#key").val()
	if (key.length > 0){
		getData(`${link}/branch/by/link`,'POST',{"key" : key},(data)=>{
		})
	}else{
	}
})


$("#add_service").on("click",(me)=>{
	let service_name = $("#service_name_service").val()
	let code = $("#code").val()
	let icon_id =$("#icon_id").val()
	let spl = icon_id.split(" ");
	let king = icon_id.split(" ").length > 1 ? `${spl[0]}_${spl[1]}` : icon_id ;
	console.log(">>>>>",king)
	let icons_id_data = $(`#option_${king}`).attr("attr-id")
	console.log("+++++++++",`option_${king}`)
	
	let data_final = {
		"name" : service_name,
		"teller": "",
		"branch_id": branch_id,
		"code" : code,
		"icon_id" : icons_id_data
	}
	if (service_name && code && icon_id){
		getData(`${link}/service/make`,'POST',data_final,(data)=>{
			updateIcons()
			updateServices()
			let count = 0;
			for(x in data){count++;}
			if(count){
				$("#message_service").html(`<div class="alert alert-success" role="alert">Service Added Successfully</div>`)

			}else{
				// $("#message_service").html(data.msg)
				$("#message_service").html(`<div class="alert alert-danger" role="alert">Error Adding Service</div>`)

			}
		})
	}else{
	}
})


var icon_data;
$("#icon_file_icon").change(function() {
	readURL(this);
	
});

$("#upload_icon").on("click",(e)=>{
	let icon = icon_data
	console.log(icon)
	let icon_name = $("#icon_name").val()

	if (icon && icon_name){
			getData(`${link}/service/icon`,"POST",{"icon" : icon, "name" : icon_name,"branch_id":branch_id},(data)=>{
				updateIcons()
				updateServices()
		if(data.msg){
			$("#message_icon").html(`<div class="alert alert-success" role="alert">Icon Added Successfully</div>`)
		}else{
			$("#message_icon").html(`<div class="alert alert-danger" role="alert">Error Adding Icon</div>`)
		}
	})
	}else{
		$("#message_icon").html(`<div class="alert alert-danger" role="alert">Error All Fields Data Required.</div>`)
	}
})

var video_data;
function vidUrl(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			video_data = reader.result
		}
		reader.readAsDataURL(input.files[0]); // convert to base64 string
		}
}



$("#file").change(function() {
	vidUrl(this);
});

// upload_video
$("#upload_video").on("click",(e)=>{
	let icon = video_data
	console.log(icon)
	// if (file){

	// 	getData(`${link}/video/upload`,"POST",{"file" : icon},(data)=>{
	// 				console.log("data>>>>>>>",data)
	// 		if(data.msg){
	// 			$("#video_message").html(`<div class="alert alert-success" role="alert">Icon Added Successfully</div>`)
	// 		}else{
	// 			$("#video_message").html(`<div class="alert alert-danger" role="alert">Error Adding Icon</div>`)
	// 		}
	// 	})
	// }else{
	// 	$("#video_message").html(`<div class="alert alert-danger" role="alert">Error All Fields Data Required.</div>`)
	// }
})

$("#add_teller").on("click",()=>{
	let teller_number = $("#teller_number_teller").val()
	console.log("teller_number",teller_number)
	tellerExists(teller_number,(data)=>{
		if(!data){
			let service_name= $("#service_to_offer").val()
			let final_serviceName =service_name.split("-")[0]
			let final = {
				"branch_id" : branch_id,
				"teller_number" : teller_number,
				"service_name" : final_serviceName
			}
			getData(`${link}/teller/add`,"POST",final, (data)=>{
				console.log(">>>><<>>",data)
				let count = 0;
				for(x in data){count++;}
				if(count){
				//	added successfully
				// 	add_teller_msg
					$("#add_teller_msg").html(`<div class="alert alert-success" role="alert">Success Adding Teller</div>`)
				}else{
				//	was not added successfully
					$("#add_teller_msg").html(`<div class="alert alert-danger" role="alert">Error Adding Teller</div>`)
				}
			})
		}else{
		// teller with that number exists
			$("#add_teller_msg").html(`<div class="alert alert-danger" role="alert">Error! Teller number Exists</div>`)
		}
	})
})


// get all comments
const getComments = (issue_id) => {
	let prev_comment = $("#prev_comment")
	let this_comment = $("#the_comment")
	let next_comment = $("#next_comment")

	// getData(`${link}/get/comments`,"POST",{"issue_id": issue_id},(data)=>{
	// 	let final_data = []
	// 	if (data.length < 3 ){ next_comment.hide()}
	// 	console.log(data.length)
	// 	if(data){
	// 		data.map((value,index)=>{
	// 			if(value.active){
	// 				final_data.push(JSON.stringify(value))
	// 				this_comment.html(`<p>${value.remarks}</p> <small> Teller from  — ${value.teller_from}</small><br><small> Date Forwarded  : ${new Date(value.date_added).toLocaleString()}</small>`)
	// 			}
	// 		})
	// 	}else{
	// 		prev_comment.hide()
	// 		next_comment.hide()
	// 		this_comment.html("<small>No Comments</small>")
	// 	}
	// 	sessionStorage.setItem("comments",final_data)
	// })
}

//setting  the teller number
let teller_number_ = localStorage.getItem("tellerNumber") ? localStorage.getItem("tellerNumber")  : "—"
$("#teller_number_now").html(teller_number_)

const tellerExists = (teller_number,handle) => {
	getData(`${link}/teller/exists`,"POST",{"teller":teller_number,"branch_id":branch_id},(data)=>{
		let count = 0;
		for(x in data){count++;}
			if(count){
				final = true
				console.log("true")
			}else{
				final = false
				console.log("false")
			}
			handle(final)
	})
}

$("#settings").on("click",()=>{
	$("#myModal").show()
});

$(".close").on("click",()=>{
	$("#myModal").hide()
});


function _(el){
	return document.getElementById(el);
}
function uploadFile(){
	var file = _("file1").files[0];
	// alert(file.name+" | "+file.size+" | "+file.type);
	var formdata = new FormData();
	formdata.append("file", file);
	var ajax = new XMLHttpRequest();
	ajax.upload.addEventListener("progress", progressHandler, false);
	ajax.addEventListener("load", completeHandler, false);
	ajax.addEventListener("error", errorHandler, false);
	ajax.addEventListener("abort", abortHandler, false);
	ajax.open("POST", "http://localhost:1000/video/upload");
	ajax.send(formdata);
}
function progressHandler(event){
	var percent = (event.loaded / event.total) * 100;
	_("progressBar").value = Math.round(percent);
	_("status").innerHTML = Math.round(percent)+"%";
}
function completeHandler(event){
	_("status").innerHTML = event.target.responseText;
	_("progressBar").value = 0;
}
function errorHandler(event){
	_("status").innerHTML = "Upload Failed";
}
function abortHandler(event){
	_("status").innerHTML = "Upload Aborted";
}



