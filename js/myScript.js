$(document).ready(function(){

var window_focus;

$(window).focus(function() {
    window_focus = true;
}).blur(function() {
    window_focus = false;
});

$('#unjoinroom').click(function(){
	try{	
		socketio.removeListener('chat'+roomId,newChat);
	}
	catch(exc){
		throw exc;
	}
});

	var socketio = io.connect(""); // connecting to node server using socket.io, and here we go live with the server broadcasts
	var myId='';
	var roomId='';
	var myRoomId='';
	if(localStorage.userId){
		myId=localStorage.userId;
		socketio.emit('getrooms',{});
		window.location.hash='chatRooms';
		socketio.on('forcelogout'+myId,function(data){
        myId='';
  		localStorage.clear();
  		window.location.hash='join';
  		
    });
		socketio.on("msg"+myId,function(msgData){
		if(msgData.type="roomCreate"){
			myRoomId=msgData.id;
		}
	});
	}
	else{
		$('#logout').hide();
	  window.location.hash='';		
	}

	socketio.on("welcome",function(myData){
      if(socketio.id==myData.id)
		{
			myId=myData.userId;
			localStorage.userId=myId;
		
		socketio.on("msg"+myId,function(msgData){
		if(msgData.type="roomCreate"){
			myRoomId=msgData.id;
		}
		});
		}
	});
	socketio.on("chatroom",function(data){
		$('#chatroomlist').html('');
		data.rooms.forEach(function(item){
			var container=$('<div class="col-sm-3">');
			var panel=$('<div class="panel panel-primary">');
				container.append(panel);
				var panelhead=$('<div class="panel-heading">');
					panel.append(panelhead);
					var panelTitle=$('<h3 class="panel-title">');
						panelTitle.attr('roomid',item.id);
						panelTitle.html(item.name);
						panelhead.append(panelTitle);
			var parent=$('<div class="panel-body text-center">');
				
			var elem=$('<div class="btn btn-success">');
			var closeBtn=$('<i class="text-muted glyphicon glyphicon-remove pull-right" style="padding:3px;">');
			    closeBtn.click(function(){
			    	socketio.emit("deleteRoom",{roomId:$(this).parent().attr('roomid')});
			    });
			    elem.html('Join');
			    
			    elem.attr('id',item.id);
			    elem.click(function(){
			    	try{	
			    		socketio.removeListener('chat'+roomId,newChat);
			    	}
			    	catch(exc){
			    		throw exc;
			    	}

			    	roomId=$(this).attr('id');
			    	$('#chatwindow').html('');
			    	$('#roomname').html($(this).html());
			    	socketio.on('chat'+item.id,newChat);
			    	window.location.hash='chatRoom';
			    });

			    parent.append(elem);
			    if(item.owner==myId)
			    	panelTitle.append(closeBtn);
			    panel.append(parent);
			    $('#chatroomlist').append(container);
		});
	});
	



// join chat app
	$("#btn-join").click(function(e){
		e.preventDefault();

		if($(this).hasClass('btn-success')){
			socketio.emit("join",{name:$('#userName').val()});
			window.location.hash='chatRooms';
		}
		
	});

	$('#userName').keyup(function(e){
		if($(this).val().length>3){
			$('#btn-join').removeClass('btn-default');
			$('#btn-join').addClass('btn-success');
		}
		else{
			$('#btn-join').removeClass('btn-success');
			$('#btn-join').addClass('btn-default');	
		}
	});
//end join

//create chat room
$("#createRoom").click(function(e){
		e.preventDefault();

		if($(this).hasClass('btn-success')){
			socketio.emit("createRoom",{name:$('#newRoomname').val(),userId:myId});
			$('#newRoomname').val('');
		}
		
	});

	$('#newRoomname').keyup(function(e){
		if($(this).val().length>3&&$(this).val().length<15){

			$('#createRoom').removeClass('btn-default');
			$('#createRoom').addClass('btn-success');
		}
		else{
			$('#createRoom').removeClass('btn-success');
			$('#createRoom').addClass('btn-default');	
		}
	});
//end chat room creation

//send chats
$("#sendmsg").click(function(e){
		e.preventDefault();

		if($(this).hasClass('btn-success')){
			socketio.emit("chat",{msg:$('#newmsg').val(),roomId:roomId,userId:myId});
			$('#newmsg').val('');
			$('#sendmsg').removeClass('btn-success');
			$('#sendmsg').addClass('btn-default');
		}
		
	});

	$('#newmsg').keyup(function(e){
		if($(this).val().length>1){
			
			$('#sendmsg').removeClass('btn-default');
			$('#sendmsg').addClass('btn-success');
			if(e.keyCode){
				if(e.keyCode==13)
					$("#sendmsg").click();
			}
			else if(e.key){
				if(e.key=='Enter')
					$("#sendmsg").click();
			}
		}
		else{
			$('#sendmsg').removeClass('btn-success');
			$('#sendmsg').addClass('btn-default');	
		}
	});

	//end send chats

	$.localScroll.defaults.axis = 'x';

			$.localScroll({
				target: '#main-scoll', // could be a selector or a jQuery object too.
				queue:true,
				duration:1000,
				hash:true,
				onBefore:function( e, anchor, $target ){
					// The 'this' is the settings object, can be modified
				},
				onAfter:function( anchor, settings ){
					// The 'this' contains the scrolled element (#content)
				}
			});



$('#logout').click(function(){
  socketio.emit('logout',{userId:myId});
  myId='';
  localStorage.clear();
  window.location.hash='join';
});



function notifyMe(chatData) {
  if (!Notification) {
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();

  var notification = new Notification('Message from '+chatData.from, {
    icon: '../img/icon.jpg',
    body: chatData.msg,
  });

  notification.onclick = function () {
    window.focus();
  }
}


function newChat (chatData){
	  if(myId!=chatData.userId&&!window_focus)
	  	notifyMe(chatData);
	  var chatThread='<span class="chat-name">'+chatData.from+'</span>:<span class="text-muted">'+chatData.msg+'</span><br>';
	  $('#chatwindow').append(chatThread);
  };



});