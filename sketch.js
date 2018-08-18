// Keep track of our socket connection
let socket;
// Keep the textarea in variable
let textArea;
// Keep teamId in it
let teamId;

function setup()
{

	// Start a socket connection to the server
    // Some day we would run this server somewhere else
 	socket = io.connect('https://coditor.herokuapp.com/'/*'http://localhost:3000'*/);
	teamId=prompt("Enter Your Team Id : (Please be case sensitive)");
	socket.emit("teamId",teamId);
    teamIdp=$("#teamId");
	let p=""+teamIdp.text()+teamId;
	teamIdp.text(p);

	textArea=select("#textArea");
	textArea.value("");
	$('textArea').attr('cols',windowWidth/8);
	$('textArea').attr('rows',windowHeight/30);
	$("#textArea").keypress(function(k){
        if(k.which!=8&&k.which!=46){
    		var data={
    			index: $('#textArea').prop("selectionStart"),
    			char: k.which,
                id: socket.id,
    		};
    		socket.emit("CharCode",data);
            //console.log("keypress : "+k.which+", "+k.keyCode);
        }
	});
	$("#textArea").keydown(function(k){
		if(k.which==8||k.which==46||k.which==190){
			var data={
				index: $('#textArea').prop("selectionStart"),
				char: k.which,
                id: socket.id,
			};
			socket.emit("CharCode",data);
            //console.log("keydown : "+k.which+", "+k.keyCode);
		}});

	$('#sync').click(syncing);
	$('#delete').click(deletingAll);
	$('#backspace').click(backspacing);

    // We make a named event called 'Data' and write an
    // anonymous callback function
    socket.on('CharCode',
        // When we receive data
        function(data) {
            if(socket.id!=data.id){
              	let t=textArea.value();
    		  	let len=t.length;
    			if(data.char==8){
    				t=t.substring(0,data.index-1)+t.substring(data.index,len);
    			}else if(data.char==46){
    				t=t.substring(0,data.index)+t.substring(data.index+1,len);
                }else if(data.char==190){
                    t=t.substring(0,data.index)+"."+t.substring(data.index,len);
                    //console.log(". recieved");
                }else{
    				t=t.substring(0,data.index)+String.fromCharCode(data.char)+t.substring(data.index,len);
    			}
    		  	textArea.value(t);
            }
        }
    );

    // receive sync message
	socket.on('Sync',function(data){
        if(socket.id!=data.id){
		        textArea.value(data.t);
        }
	});

}

function draw() {
  // Nothing
}

function syncing(){
	socket.emit("Sync",{
                        t: textArea.value(),
                        id: socket.id,
                        }
                );
}

function deletingAll(){
	textArea.value("");
	syncing();
}

function backspacing(){
	let index= $('#textArea').prop("selectionStart");
	let t=textArea.value();
	let len=t.length;
	t=t.substring(0,index-1)+t.substring(index,len);
	textArea.value(t);
	syncing();
}
