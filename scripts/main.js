let addr = localStorage.getItem("server_ip")
let link = `http://${addr}:1000`
let branch_id;

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

const verifyKey = (me) => {
	let key = $("#key").val()
	console.log(key)
	getData(`${link}/app/activate`,"POST",{"key" : key},(data)=>{
		console.log(data)
		if(data){
			localStorage.setItem("branch_info",JSON.stringify(data))
			localStorage.setItem("key",data["key_"])
			$("#branch").html(data.name)
			$("#date").html(new Date())
			$("#services").show()

			
		}else{
			// app not activated
			console.log("data not available")
			$("#branch").html(`
			<img src="./images/key.png" alt="" height="40px" class="mt-3">
			<div class="mt-2">Error! Application not activated</div>
			<div class="text-muted">Please make sure you active the application from the backend provided</div>
			`)
			$("#services").hide()
			localStorage.setItem("tellerNumber","")
		}
	})
}

verifyKey()

if(localStorage.getItem("branch_info")){
	branch_id = JSON.parse(localStorage.getItem("branch_info")).id
}

let country_id = 1;
let teller = localStorage.getItem("key") ? localStorage.getItem("tellerNumber") : 0;
console.log()


const sio = io(`http://${addr}:5500/`);


sio.on('connect', () => {
  console.log('connected');

});

sio.on('disconnect', () => {
  console.log('disconnected');
});

sio.on('hello_data', () => {
  console.log('hello_data');
  	getUpcoming();
		getNext();
		getActive();
		// getAll();
		required_services()
		updateQueue()
});

sio.on("online_booking_data",()=>{
		getNext();
		getActive();
		required_services()
		updateQueue()
})


// end socket implementation
const set_server_ip = () => {
	let server_ip = $("#server_ip").val()
	if(server_ip){
		localStorage.setItem("server_ip",server_ip)
		$("#server_ip").attr("placeholder",`Currently Set As '${addr}'`)
		$("#message_ip").html(`<div class="alert alert-success" role="alert">Success! Make sure to restart app.<br> for changes to take effect</div>`)
		reload()
	}
}


const reload = () => {
	setTimeout(()=>{
		document.location.reload()
	},10)
}

const verify_ticket = () =>{
	let code = $(`#verify_ticket`).val()
	if ($(`#verify_ticket`).val().length <= 5){
		$("#ticket_status").html(`<div class="alert alert-danger" ">Code Too Short</div>`)
	}else{
		getData(`${link}/verify/ticket`,"POST",{"code" : code},(data)=>{
				console.log(data)
				if(data.status){
					console.log("1")
					$("#ticket_status").html(`<div class="alert alert-success" ">Ticket Valid</div>`)

				}else{
					console.log("2")

					$("#ticket_status").html(`<div class="alert alert-danger" ">Ticket Invalid</div>`)
				}
			
		})
	}
	$("#ticket_status").html(final)
	
}


let online_status = $(".status");
let text_status = $(".status_text");



const set_teller_number =()=>{
	let teller_number = $("#teller_number").val()
	getData(`${link}/teller/exists`,"POST",{"teller":teller_number,"branch_id" :branch_id},(data)=>{
		let count = 0;
		for(x in data){count++;}
		if(count){
			if(teller_number){
				if(Number(teller_number)){
					localStorage.setItem("tellerNumber",Number(teller_number))
					$("#message_teller").html(`<div class="alert alert-success" role="alert">Success Changing Teller. Make sure to restart app.<br> for changes to take effect</div>`)
					reload()
				}else{
					$("#message_teller").html(`<div class="alert alert-danger" role="alert">Error must be a number.</div>`)
				}
			}
		}else{
			$("#message_teller").html(`<div class="alert alert-danger" role="alert">Teller Does Not Exist.</div>`)
		}
	})
}



// const sync_service = (e)=>{
// 	sync()
// }




let key = localStorage.getItem("key")

// getData(`${link}/branch/by/key`,"POST",{"key" : key},(data)=>{
// 	console.log(data)
// 	console.log("CCCCC>")
// 	if(data.status){
// 		$("#branch").html(data.name)
// 		$("#date").html(new Date())
// 		$("#services").show()
// 	}else{
// 		$("#branch").html(`
// 		<img src="./images/key.png" alt="" height="40px" class="mt-3">
// 		<div class="mt-2">Error! Application not activated</div>
// 		<div class="text-muted">Please make sure you active the application from the backend provided</div>
// 		`)
// 		$("#services").hide()
// 		localStorage.setItem("tellerNumber","")
// 	}
// })

const enableInput = (handle) =>{
	$(`#${handle}`).prop("disabled",false)
}


const verifyKey_ = ()=>{
	let key = $("#key").val()
	if(key) {
	//	message_key
		verifyKey(key)
		reload()
	}else {
		$("#message_key").html(`<div class="alert alert-danger" role="alert">Key cannot Be empty</div>`)
	}
}

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


const readURL = (input) =>  {
if (input.files && input.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		icon_data = reader.result
	}
	reader.readAsDataURL(input.files[0]); // convert to base64 string
	}
}

const getActive = (call=12) => {
		getData(`${link}/get/active/ticket`,"POST",{"teller_id":teller,"branch_id" : branch_id},(data)=>{
			console.log("FGFFGFGFGG",data)
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

				let handle = $("#nxtTicket")
				handle.prop("disabled",true)
				// play(data.caller)
				let caller = data.caller
				let local_link = `http:/${addr}:9900`
				getData(`${local_link}/callout`,"POST",{"phrase" : caller},(data)=>{
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

const getAllOne = () => {
		getData(`${link}/tellers/get/all`,"POST",{"branch_id":branch_id},(tellers)=>{
		let final =" "
		console.log(tellers)
		tellers.map((data,index)=>{
			if(Number(data.number) === Number(localStorage.getItem("tellerNumber"))){

			}else{
				final += `<a class="dropdown-item"  onclick="getTellerInfoOne(this)" class="tellers" id="${data.number}-${data.service}">Teller ${data.number} - ${data.service}</a>`
			}
		})
		$("#tellerOptionsOne").html(final)
	})
};

const getAllTwo = () => {
		getData(`${link}/tellers/get/all`,"POST",{"branch_id":branch_id},(tellers)=>{
		let final =`<a class="dropdown-item"  onclick="getTellerInfoTwo(this)" class="tellers" id="Null">None</a>`
		console.log(tellers)
		tellers.map((data,index)=>{
			if(Number(data.number) === Number(localStorage.getItem("tellerNumber"))){

			}else{
				final += `<a class="dropdown-item"  onclick="getTellerInfoTwo(this)" class="tellers" id="${data.number}-${data.service}">Teller ${data.number} - ${data.service}</a>`
			}
		})
		$("#tellerOptionsTwo").html(final)
	})
};



const required_services = () => {
		getData(`${link}/tellers/get/all`,"POST",{"branch_id":branch_id},(tellers)=>{
		let final =" "
		tellers.map((data,index)=>{
			if(Number(data.number) === Number(localStorage.getItem("tellerNumber"))){

			}else{
				final += `<a class="dropdown-item"  onclick="makeConfirmation(this)" class="tellers" id="${data.number}">Teller ${data.number} - ${data.service}</a>`
			}
		})
		$("#forwardWithOptions").html(final)
	})
};

const makeConfirmation = (me) =>{
	console.log(me.id)
}

const getNext = () =>{
		// next ticket
		
	getData(`${link}/get/next/ticket`,"POST",{"teller_id":teller,"branch_id" : branch_id},(data)=>{
		console.log("teller",teller)
		console.log(data)
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
	"ss"
	let mapper = ["","bookingOne","bookingTwo","bookingThree","bookingFour","bookingFive"]
	getData(`${link}/get/upcoming/tickets`,"POST",{"teller_id":teller,"branch_id":branch_id},(data)=>{
		console.log("Ucpcoing", data)
		console.log("ADDRESS", addr)
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
	// getAll()
	required_services()
	updateQueue()
});

const getTellerInfoOne = (me) => {
	let this_id = me.id
	let comment = $("#this_comment").val()  ? $("#this_comment").val().trim() : "—"
	let service_split = this_id.split("-")
	let id = service_split[0]
	let service_name = service_split[1]
	$("#forwarded_to").html(`To be forwarded to teller ${id} [${service_name}]`)
	sessionStorage.setItem("forwarded_to",id)
	// here we are going to foward the ticket
	// getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":this_id,"comment" :comment},(data)=>{
	// 	// getUpcoming();
	// 	// getNext();
	// 	// getAll();
	// 	$("#booking_type").html("—");
	// 	$("#ticket_type").html("—");
	// 	$("#fowarded").html("—");
	// 	$("#activeTicket").html("—");
	// 	$("#this_comment").val("")
	// 	$('#this_comment').hide()
	// 	sio.emit('hello',"")
	// })
};

const getTellerInfoTwo = (me) => {
	let this_id = me.id
	let comment = $("#this_comment").val()  ? $("#this_comment").val().trim() : "—"
	let service_split = this_id.split("-")
	let id = service_split[0]
	let service_name = service_split[1]
	if (id === "Null"){
		$("#requirement").html(`No Mandatory Task Required.`)
		sessionStorage.setItem("mandatory",null)
	}else{
		$("#requirement").html(`but first required to pass though teller ${id} [${service_name}] `)
	}
	sessionStorage.setItem("mandatory",id)
	// here we are going to foward the ticket
	// getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":this_id,"comment" :comment},(data)=>{
	// 	// getUpcoming();
	// 	// getNext();
	// 	// getAll();
	// 	$("#booking_type").html("—");
	// 	$("#ticket_type").html("—");
	// 	$("#fowarded").html("—");
	// 	$("#activeTicket").html("—");
	// 	$("#this_comment").val("")
	// 	$('#this_comment').hide()
	// 	sio.emit('hello',"")
	// })
};

const nextTicket = () => {
	getData(`${link}/ticket/service`,"POST",{"teller_id" : teller,"branch_id":branch_id},(data)=>{
		getUpcoming();
		getNext();
		getActive(120);
		required_services();
		sio.emit('next_ticket',"")
	})
};

const closeTicket = () =>{
	sessionStorage.getItem("active_ticket")

	getData(`${link}/ticket/close`,"POST",{"teller_id" : teller},(data)=>{
		$('#this_comment').hide()
		sio.emit('hello',"")
		sio.emit('next_ticket',"")
		// getUpcoming();	
		// getNext();
		// getAll();
		// required_services()
		
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
// },3000);


// setInterval(()=>{
// 	sync()
// },60000)

const settings_data = () => {
	$(".modal-content").html(
		`
		<span class="close" onclick="closeModal()" style="text-align:right">&times;</span>
		<div id="pop" class="col-lg-12">
			<h5  id="action_">Settings</h5>
			<button class="btn btn btn-outline-success btn-sm  modalInfo mt-4 mb-4 pl-4 pr-4" onclick="open_portal()">Open The Branch Management Portal</button>
			<div class="row  details">
				<!-- test -->
				<div class="col mt-3 " style="font-size:12px">
				<h5  id="action_">Manager Teller and Service Offered</h5>
				<div class="row">
					<div class="col-lg-12 mb-3"  id="allocated_">
						<div class="row">
							<div class="col-lg-6 mt-4">
								<h5 class="header text-muted">Set Teller As</h5>
								<div id="message_teller"></div>
								<div class="tellerNumber text-muted">
									<h1 id="tellerNumber">
										—
									</h1>
								</div>
								<label for="icon_name">Teller Number </label>
								<input type="text" id="teller_number" name ="icon_name" class="form-control form-control-sm">
								<button class="btn btn btn-info btn-sm col-lg-6 modalInfo mt-4" id="set_teller_number"  onclick="set_teller_number()">Set Teller</button>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-6 mt-4">
								<h5 class="header text-muted">Set Server Address</h5>
								<div id="message_ip"></div>
								<div class="tellerNumber text-muted">
								</div>
								<label for="server_ip">Server Address</label>
								<input type="text" id="server_ip" name ="icon_name" class="form-control form-control-sm" placeholder="Please Set Address Before using app.'">
								<button class="btn btn btn-info btn-sm  modalInfo mt-4" id="set_server_ip" onclick="set_server_ip(this)">Set The Server Address</button>
							</div>
						</div>

					</div>
				</div>`
		)
}
`
		<span class="close" onclick="closeModal()" style="text-align:right">&times;</span>
		<div id="pop" class="col-lg-12">
			<h5  id="action_">Settings</h5>
			<!-- body start -->
			<!-- top card  -->
			<div class="row details">
				<!-- test -->
				<div class="col mt-3 " style="font-size:12px">
				<h5  id="action__">Actions</h5>
				<div class="row">
					<div class="col-lg-4 mb-3"  id="allocated">
					<p class="actions">Enter Your branch Activation Key <br><small>This key is allocated to you via email after registration</small></p>
						<div id="message_key"></div>
						<div class="form-group">
							<label for="key">Key</label>
							<input class="form-control form-control-sm" id="key" rows="1" style="width:40rem;font-family:monospace;" />
						</div>
						<button class="btn btn btn-outline-primary btn-sm col-lg-5"  id="verifyKey" onclick="verifyKey(this)">Verify</button>
					</div>
				</div>
			</div>
			<div class="row  col-lg-12 details">
				<!-- test -->
				<div class="col mt-3 " style="font-size:12px">
				<h5  id="action_">Manager Teller and Service Offered</h5>
				<div class="row">
					<div class="col-lg-12 mb-3"  id="allocated_">
						<div class="row">
							<div class="col-lg-6">
								<h5 class="header text-muted mb-3">Add Service</h5>
								<label for="service_name_service">Service Name</label>
								<div id="message_service"></div>
								<input type="text" id="service_name_service" name ="service_name" class="mb-3 form-control form-control-sm">
								<div class="row mt-3">
									<div class="col-lg-6">
										<label for="code">Code</label>
										<input type="text" id="code" name ="code" class="form-control form-control-sm">
									</div>
										<div class="form-group col-lg-6">
											<label for="icon_id">Icon</label>
											<select class="form-control form-control-sm" id="icon_id">
											</select>
									    </div>
									<div class="form-group col-lg-6">
										<label for="icon_id">Visible</label>
										<div class="mb-3">
											<small class="text-muted "><b><mark>If visible the service shall be available to the users in the <i>Android APP</i>.</mark></b></small>
										</div>
										<select class="form-control form-control-sm" id="service_visibility">
											<option value="null">Visibility Status</option>
											<option value="0">Not Visible</option>
											<option value="1">Visible</option>
										</select>
									</div>
								</div>
								<div class="btn btn btn-outline-primary btn-sm col-lg-12 modalInfo mt-4"  id="add_service" onclick="add_service(this)">Add Service</div>
							</div>
							<div class="col-lg-6">
								<h5 class="header text-muted mb-3">Add Teller</h5>
								<div id="add_teller_msg"></div>
								<div class="row">
								<div class="col-lg-6">
									<label for="teller_number_teller">Teller Number</label>
								    <input type="text" id="teller_number_teller" name ="teller_id" class="form-control form-control-sm">
								</div>
									<div class="form-group col-lg-6">
										<label for="service_to_offer">Service To Offer</label>
										<select class="form-control form-control-sm" id="service_to_offer">
										</select>
									</div>
								</div>
								<div class="btn btn btn-outline-primary btn-sm col-lg-12 modalInfo mt-4"  id="add_teller" onclick="add_teller(this)">Add Teller</div>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-6 mt-4">
								<form action="" enctype="multipart/form-data" name="upload_icon" id="form_upload_icon">
									<h5 class="header text-muted">Add Icon</h5>
									<div id="message_icon"></div>
									<label for="icon_name">Icon Name</label>
									<input type="text" id="icon_name" name ="icon_name" class="form-control form-control-sm">

									<label for="icon_file_icon" class="mt-2">Icon File</label>
									<input type="file" id="icon_file_icon" name ="icon" class="form-control form-control-sm " accept="image/* ">
									<input class="btn btn btn-outline-primary btn-sm col-lg-12 modalInfo mt-4"   name="submit" id="upload_icon" onclick="upload_icon_()" value="upload Icon">
								</form>
							</div>

							<div class="col-lg-6 mt-4">
									<h5 class="header text-muted">Set Teller As</h5>
									<div id="message_teller"></div>
									<div class="tellerNumber text-muted">
										<h1 id="tellerNumber">
											4
										</h1>
									</div>
									<label for="icon_name">Teller Number </label>
									<input type="text" id="teller_number" name ="icon_name" class="form-control form-control-sm">
									<button class="btn btn btn-outline-danger btn-sm col-lg-12 modalInfo mt-4" id="set_teller_number"  onclick="set_teller_number()">Set Teller</button>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-6 mt-5">
									<h5 class="header text-muted">Sync Services</h5>
									<p class=" text-muted mt-2">Please Click here to sync services manually. Service syncing is done when there is network issues or when some service offered/bookings are not available to the online app but are available offline. <br>Please also make sure that you have internet prior to clicking the synce services button.</p>
									<div id="message_sync"></div>
									<div id="loading_gif" style="display:none;"><img src="./images/loading.gif" alt="" height="70px" ></div>
									<button class="btn btn btn-outline-danger btn-sm col-lg-12 modalInfo mt-4" id="sync_service" onclick="sync_service(this)">Sync Service</button>
							</div>
							<div class="col-lg-6 mt-5">
								<form action="" enctype="multipart/form-data" name="upload_icon" id="form_upload_video">
									<h5 class="header mb-5 text-muted">Upload Video</h5>
									<div id="video_message"></div>
									<form class="mt-5" method=post action="http://localhost:1000/video/upload" enctype=multipart/form-data > 
									<a target="_blank" class="btn btn-sm btn-outline-primary col-lg-12" href="http://localhost:1000/upload">Upload Video</a>
								</form>
							</div>
							<!-- uplaod video link  -->
						</div>
						<div class="row">
							<div class="col-lg-6 mt-5">
								<h5 class="header text-muted">Reset Tickets</h5>
								<h6 style="color:red">									
									<b>Please be sure you intend to reset tickets.</b><br>
									<b >This is not revesable!!!</b>
								</h6>
							<button id="reset_tickets" class="btn btn-sm btn-danger mt-3 mb-3" onclick="reset_tickets()">Reset Tickets</button>
							</div>
							<div class="col-lg-6 mt-4">
								<h5 class="header text-muted">Set Server Address</h5>
								<div id="message_ip"></div>
								<div class="tellerNumber text-muted">
								</div>
								<label for="server_ip">Server Address</label>
								<input type="text" id="server_ip" name ="icon_name" class="form-control form-control-sm" placeholder="Please Set Address Before using app.'">
								<button class="btn btn btn-info btn-sm  modalInfo mt-4" id="set_server_ip" onclick="set_server_ip(this)">Set The Server Address</button>
							</div>
						</div>
					</div>
				</div>`



const foward_data = () => {
	$(".modal-content").html(
		`
		<span class="close" onclick="closeModal()" style="text-align:right">&times;</span>
		<div id="pop" class="col-lg-12">
			<h5  id="action_">Forward Ticket</h5>
			<!-- body start -->
			<!-- top card  -->
			<div class="row details">
				<!-- test -->
				<div class="col mt-3 " style="font-size:12px">
				<h5  id="action__">Forward</h5>
				<div class="row">
					<div class="col-lg-6 mb-3" id="allocated">
					 <p class="actions">Description<br><small>When one teller is selected, means that is no required steps are reuqired proir heading for that teller</small></p>
						<h5 class="text-muted mb-3"><span id="forwarded_to"></span></h5>
						<div class="dropdown">
						  <button class="btn btn-warning btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Select Teller to foward to
						  </button>
						  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="tellerOptionsOne"></div>
						</div>
					</div>
					<div class="col-lg-6 row mt-5">
						<h5 class="text-muted mt-5" id="comment_title">Previous Comment</h5>
						<p class="col-lg-10 row"><small id="the_comment">—</small></p>
						<div class="row col-lg-10">
	<!--						<button class="col-lg-3 btn-sm btn btn-outline-dark btn-special"style="display:none" id="next_comment">Next</button>-->
						</div>
					</div>

				</div>
				<br/>
				<h5  id="action__">Mandatory Teller</h5>
				<div class="row">
					<div class="col-lg-6 mb-3" id="allocated">
						<p class="actions">Description<br><small>This Task Must be attended to first before the forwarded Teller</small></p>
						<h5 class="text-muted mb-3"><span id="requirement"></span></h5>
						<div class="dropdown">
						  <button class="btn btn-warning btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Mandatotry task at teller
						  </button>
						  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="tellerOptionsTwo"></div>
						</div>
					</div>
					<div class="col-lg-6 row mt-5">
					<textarea class='form-control mt-5' id="this_comment" placeholder="Please Enters comment here " style="font-size:12px; display:none;" name="" id="" cols="40" rows="2"></textarea>
					</div>
				</div>

				<button class="btn btn-primary btn-sm mt-5 mb-5 col-lg-5" type="button" onclick="finalize_forward()">
							Finalize Fowarding the ticket
						  </button>
			</div>
				</div>`
		)
}

$("#settings").on("click",()=>{
	settings_data()
	$("#myModal").show()
	setTimeout(()=>{
	console.log(addr)
	if(addr){
		$("#server_ip").attr("placeholder",`Currently Set As '${addr}'`)
	}else{
		$("#server_ip").attr("placeholder",`Please Set Address Before using app.`)
	}

	if(localStorage.getItem("key")){
	//gettingthe key info
	let key = localStorage.getItem("key").trim()
	if (key.length !== 64){
		//	 there is an issue with the key
		$("#key").attr("placeholder","Activation Key Error!")
		$("#key").addClass("is-invalid")
		$("#key").removeClass("is-invalid")
	}else{
		//	key is valid
		$("#key").attr("placeholder",key)

	}
}else{
//	no key
}

$("#tellerNumber").html(teller)
$("#icon_file_icon").change(function() {
	readURL(this);
});

},1)
});


const closeModal = () => {
	$("#myModal").hide()
	
}

$("#forward").on("click",()=>{
	sessionStorage.setItem("mandatory",null)
	sessionStorage.setItem("forwarded_to",null)
	foward_data()
	$("#myModal").show()
	setTimeout(()=>{
		getAllOne()
		getAllTwo()
	},20)
})


// $(".close").on("click",()=>{
// 	$("#myModal").hide()
// });


// $("#moreInfo").on("click",(me)=>{
// 	let key  = $("#key").val()
// 	if (key.length > 0){
// 		getData(`${link}/branch/by/link`,'POST',{"key" : key},(data)=>{
// 		})
// 	}else{
// 	}
// })


const add_service = (me)=>{
	let service_name = $("#service_name_service").val()
	let code = $("#code").val()
	let icon_id =$("#icon_id").val()
	let spl = icon_id.split(" ");
	let king = icon_id.split(" ").length > 1 ? `${spl[0]}_${spl[1]}` : icon_id ;
	let icons_id_data = $(`#option_${king}`).attr("attr-id")
	let visible = $("#service_visibility").val()
	let data_final = {
		"name" : service_name,
		"teller": "",
		"branch_id": branch_id,
		"code" : code,
		"icon_id" : icons_id_data,
		"visible" : Number(visible) === 0 ? false : true
	}
	if (service_name && code && icon_id){
		getData(`${link}/service/make`,'POST',data_final,(data)=>{
			updateIcons()
			updateServices()
			let count = 0;
			for(x in data){count++;}
			if(!data.msg){
				$("#message_service").html(`<div class="alert alert-success" role="alert">Service Added Successfully</div>`)
				sio.emit("service_mod","")
				console.log(sio)
			}else{
				// $("#message_service").html(data.msg)
				$("#message_service").html(`<div class="alert alert-danger" role="alert">${data.msg}</div>`)

			}
		})
	}else{
	}
}


var icon_data;

const upload_icon_ = (e)=>{
	let icon = icon_data
	console.log(icon)
	let icon_name = $("#icon_name").val()

	if (icon && icon_name){
		getData(`${link}/service/icon`,"POST",{"icon" : icon, "name" : icon_name,"branch_id":branch_id},(data)=>{
			updateIcons()
			updateServices()
			console.log(data)
			if(data.status === 201){
				$("#message_icon").html(`<div class="alert alert-success" role="alert">${data.msg}</div>`)
			}else{
				$("#message_icon").html(`<div class="alert alert-danger" role="alert">${data.msg}</div>`)
			}
		})
	}else{
		$("#message_icon").html(`<div class="alert alert-danger" role="alert">Error All Fields Data Required.</div>`)
	}
}

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

const open_portal =  () =>{
	// getData(`http://${addr}:1000/open/portal`,"POST",{"server_addr" : addr},()=>{


	// })
	// window.location.href = `http://${addr}:9000`
	window.open(`http://${addr}:9000`, '_blank');
}

$("#file").change(function() {
	vidUrl(this);
});

// upload_video
$("#upload_video").on("click",(e)=>{
	let icon = video_data
})

const finalize_forward = () =>{
	let frwd = sessionStorage.getItem("forwarded_to")
	let mandatory = sessionStorage.getItem("mandatory")
	let comment = $("#this_comment").val()

	if(mandatory !== "null" && frwd === "null"){
		console.log("mandtory but forwarded")
		getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":mandatory,"comment" :comment,"mandatory" : null},(data)=>{
			$("#booking_type").html("—");
			$("#ticket_type").html("—");
			$("#fowarded").html("—");
			$("#activeTicket").html("—");
			$("#this_comment").val("")
			$('#this_comment').hide()
			sio.emit('hello',"")
			sio.emit('next_ticket',"")
		})
	} else if (mandatory === "null"){
		console.log("just normal forward")
		// we assume this is anormal forward
		// here we are going to foward the ticket
		getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":frwd,"comment" :comment,"mandatory" : null},(data)=>{
			$("#booking_type").html("—");
			$("#ticket_type").html("—");
			$("#fowarded").html("—");
			$("#activeTicket").html("—");
			$("#this_comment").val("")
			$('#this_comment').hide()
			sio.emit('hello',"")
			sio.emit('next_ticket',"")
		})
	}else{

		// we assume there is a manadatory task 
		// here we are going to foward the ticket
		getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":frwd,"comment" :comment,"mandatory" : mandatory},(data)=>{
			$("#booking_type").html("—");
			$("#ticket_type").html("—");
			$("#fowarded").html("—");
			$("#activeTicket").html("—");
			$("#this_comment").val("")
			$('#this_comment').hide()
			sio.emit('hello',"")
		})
	}
	$("#myModal").hide()
	// here we are going to foward the ticket
	// getData(`${link}/ticket/forward`,"POST",{"branch_id":branch_id,"teller_from":teller,"teller_to":this_id,"comment" :comment},(data)=>{
	// 	// getUpcoming();
	// 	// getNext();
	// 	// getAll();
	// 	$("#booking_type").html("—");
	// 	$("#ticket_type").html("—");
	// 	$("#fowarded").html("—");
	// 	$("#activeTicket").html("—");
	// 	$("#this_comment").val("")
	// 	$('#this_comment').hide()
	// 	sio.emit('hello',"")
	// })
}


const add_teller = () => {
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
				let count = 0;
				for(x in data){count++;}
				if(count){
				//	added successfully
				// 	add_teller_msg
					$("#add_teller_msg").html(`<div class="alert alert-success" role="alert">Success Adding Teller</div>`)
					sio.emit("service_mod","")
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
}


// get all comments
const getComments = (issue_id) => {
	let prev_comment = $("#prev_comment")
	let this_comment = $("#the_comment")
	let next_comment = $("#next_comment")

	getData(`${link}/get/comments`,"POST",{"issue_id": issue_id},(data)=>{
		let final_data = []
		if (data.length < 3 ){ next_comment.hide()}
		console.log(data.length)
		if(data){
			data.map((value,index)=>{
				if(value.active){
					final_data.push(JSON.stringify(value))
					this_comment.html(`<p>${value.remarks}</p> <small> Teller from  — ${value.teller_from}</small><br><small> Date Forwarded  : ${new Date(value.date_added).toLocaleString()}</small>`)
				}
			})
		}else{
			prev_comment.hide()
			next_comment.hide()
			this_comment.html("<small>No Comments</small>")
		}
		sessionStorage.setItem("comments",final_data)
	})
}

//setting  the teller number
let teller_number_ = localStorage.getItem("tellerNumber") && localStorage.getItem("key") ? `Teller Number — ${localStorage.getItem("tellerNumber")} `: `<div class="row col-lg-12 mt-3">
<img class="mt-1" src="./images/teller.png" alt="" height="20px" class="mt-5">
<span class="col-lg-6 h6 mt-1 bold"> Error! Teller not set</span>
</div>`
let in_queue = localStorage.getItem("inqueue") && localStorage.getItem("key") ? `In Queue — ${localStorage.getItem("inqueue")} ` :`Queue Empty`;
$("#teller_number_now").html(`${teller_number_}`)
$("#in_queue").html(`${in_queue}`)

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

// $("#settings").on("click",()=>{
// 	$("#myModal").show()
// });
// $("#settings_").on("click",()=>{
// 	$("#myModal2").show()
// });

// $(".close").on("click",()=>{
// 	$("#myModal").hide()
// });


const reset_tickets = ()=>{
	// let val = prompt("Are You sure you want to reset ?")
	getData(`http://159.65.144.235:4000/ticket/reset`,"POST",{},(data)=>{
		if(data){

		}else{

		}
	})
}

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
	ajax.open("POST", `http://${addr}:1000/video/upload`);
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


// Swal.fire({
// 	icon: 'error',
// 	title: 'Oops...',
// 	text: 'Something went wrong!',
// 	footer: '<a href>Why do I have this issue?</a>'
//   })
const updateQueue = () =>{
	getData(`http://${addr}:1000/teller/bookings`, "POST",{"teller" : teller}, (data)=>{
		console.log(data)
		if(data){
			localStorage.setItem("inqueu", data)
			$("#in_queue").html(`In Queue — ${data}`)
		}else{
			localStorage.setItem("inqueu", false)
		}
	})
}

