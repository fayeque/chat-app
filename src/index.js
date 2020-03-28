const path =require('path');
const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const app=express();
const {generateMessage}=require('./utils/message');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/user');
const server=http.createServer(app);
const io=socketio(server);
const moment=require('moment');

const port=process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
const message="Welcome!";
io.on('connection',(socket) => {
    console.log("New connection");
    
    socket.on('join',({username,room},callback) => {
        const {error,user}=addUser({id:socket.id,username,room});
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        socket.on('typing',(data) => {
            const user=getUser(socket.id);
            if(data.typing == true){
                io.to(user.room).emit('display',{
                    data,
                    user
                })
            }
            else{
                io.to(user.room).emit('display',{
                    data,
                    user
                })
            }
        })
        socket.emit('message',generateMessage("Welcome!"));
        socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} has joined`));

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user,room)
        })


        callback();
    })

    socket.on('sendMessage',(message,callback) => {
        const user=getUser(socket.id);
        const filter=new Filter();
        if(filter.isProfane(message)){
            return callback('Bad language is not allowed!!');
        }

        io.to(user.room).emit('message',generateMessage(user.username,message));
            callback();
    })
    socket.on('disconnect',() => {
        const user=removeUser(socket.id);

        // if(user){
        //     io.to(user.room).emit("message",generateMessage(`${user.username} has left`));
        //     io.to(user.room).emit('roomData',{
        //         room:user.room,
        //         users:getUsersInRoom(user,room)
        //     })
        // }

        
    })
    socket.on('sendLocation',(coords,callback) => {
        io.emit('message',`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
        callback("Location shared!");
    })
})



server.listen(port,() => { 
    console.log(`Server started on ${port}`);
})