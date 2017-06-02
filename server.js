
var http = require('http');
var uuid = require('node-uuid');
fs = require('fs')
var users = {};
var rooms=[];
var app = http.createServer(function (request, response) {
		console.log(request.url);
		var file = request.url.indexOf(".")!=-1?'.'+request.url:'index.html';
		var type=request.url.indexOf("js")!=-1?'text/script':request.url.indexOf("css")!=-1?'text/css':'text/html';
		fs.readFile(file, 'utf8', function (err,data) {
		  if (err) {
			response.writeHead(404, {'Content-Type': 'text/html'});
		  }else{
		  
			response.writeHead(200, {'Content-Type': type}); // responding to the connection request with status code 200 (success)
			response.write(data); // giving a response to conected client
			response.end();
		}
		});
        
    
}).listen(1755); // setting the port to which this application have to listen

var io = require('socket.io').listen(app); // creating a socket server
    // io.sockets.on('disconnect', function(arg) {
    //     console.log(arg);
    // });
    io.sockets.on('connection', function(socket) {

        socket.on('join',function(data){
            var uid = uuid.v1();
            var myData={name:data.name};
            users[uid]=myData;
                io.sockets.emit("welcome",{userId:uid,id:socket.id});
                io.sockets.emit("chatroom",{rooms:rooms});
        });

        socket.on('logout',function(data){
            delete users[data.userId];
        });

        socket.on('deleteRoom',function(data){
            var rmId=data.roomId;
            rooms.forEach(function(item){
                if(rmId==item.id){
                    rooms.splice(rooms.indexOf(item),1);
                    io.sockets.emit("chatroom",{rooms:rooms});
                }
            });
        });

        socket.on('getrooms',function(data){
            io.sockets.emit("chatroom",{rooms:rooms});
        });

        socket.on('createRoom',function(data){
            var roomId=uuid.v1();
            var room={name:data.name,id:roomId,owner:data.userId};
            rooms.push(room);
            io.sockets.emit("msg"+data.userId,{type:'roomCreate',id:roomId});
            io.sockets.emit("chatroom",{rooms:rooms});
        });


        socket.on('chat',function(data){
            try{
                io.sockets.emit("chat"+data.roomId,{msg:data.msg,from:users[data.userId].name,userId:data.userId});
            }
            catch(exc){
                io.sockets.emit('forcelogout'+data.userId,{});

            }
        });

    });
