// const moment=require('moment');
const socket=io();
var typing=false;
var timeout=undefined;
const $messageForm=document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector("button");
const $messages=document.querySelector('#messages');
const $typmsg=document.querySelector("#typmsg");
const $msg=document.querySelector("#msg");

const $messageTemplate=document.querySelector('#message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const autoscroll=() => {
    const $newMessage=$messages.lastElementChild;

    //height of the new message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight;

    // height of message container
    const containerHeight=$messages.scrollHeight;

    //how far i scrolled
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop=$messages.scrollHeight;
    }

}

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
socket.on('message',(message) =>{
    console.log(message);
    msg.innerHTML="";
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm: a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

$messageFormInput.addEventListener('input',(e) => {
    typing=true;
    socket.emit('typing',{typing:true});
})

socket.on('display',(datauser) => {
    console.log(datauser);
    if(datauser.data.typing==true){
        $msg.innerHTML=`${datauser.user.username} is typing...`
    }
    else{
        $msg.innerHTML=""
    }
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');
    const message=e.target.elements.message.value;
    
    socket.emit('sendMessage',message,(error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value="";
        $messageFormInput.focus();
        // $msg.innerHTML="";
       if(error){
           return console.log(error);
       } 
       console.log("Delivered!");
    });
})

// socket.on('roomData',({room,users}) => {
//     const html=Mustache.render(sidebarTemplate,{
//         room,
//         users
//     })
//     document.querySelector("#side-bar").innerHTML=html;
// })

socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error);
        location.href="/"
    }
});


// document.querySelector('#send-location').addEventListener('click',() => {
//     if(!navigator.geolocation){
//         return alert("Location is not supported by your browser");
//     }
//     navigator.geolocation.getCurrentPosition((position) => {
//         socket.emit('sendLocation',{
//             latitude:position.coords.latitude,
//             longitude:position.coords.longitude
//         },()=>{
//             console.log('location shared');
//         })
//     })
// })