// const socketConfiq=(io)=>{

//     let connectionClients={

//     }


//     io.on("connection", (socket) => {
//         socket.on('on',(userId)=>{
//             if(userId){
//                 connectedClient[userId]=socket.id
//             }
//         })

        
//         console.log("New client connected:", socket.id);
      
//         socket.on("sendMessage", (message) => {
//           console.log("Received message:", message);
//           io.emit("receiveMessage", message); 
//         });
      
//         socket.on("disconnect", () => {
//           console.log("Client disconnected:", socket.id);
//         });
//       });
// }

// module.exports = socketConfiq;