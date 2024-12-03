const userRoute=require('./routes/user/userRoutes')
const tutorRoute=require('./routes/tutor/tutorRoutes')
const adminRoute=require('./routes/admin/adminRoutes')
const courseRoute=require('./routes/course/courseRoutes')
const dataRoutes=require('./routes/course/dataRoutes')
const authRoute = require('./routes/user/authRoute')

const express=require('express')
const mongoose=require("mongoose")
const cors=require("cors")
const path = require("path"); 
const http = require("http"); 
const socket = require("socket.io");

const cookieParser=require("cookie-parser")
const messageRouter = require('./routes/course/chat/messages')
const app = express()
const server = http.createServer(app);


app.use (express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(cors(
    {origin: 'http://localhost:5173',
      credentials: true,}
  ))

  mongoose.connect(process.env.MONGODB)
  .then(() => {
    console.log(`MongoDB connected successfully to ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'"
    );
    next();
  });
  
  console.log('hereeeeeeeeeeeeeeeeeeee')
  app.use('/message', messageRouter)
app.use("/user",userRoute)
app.use("/user/data",dataRoutes)
app.use("/tutor",tutorRoute)
app.use("/tutor/course",courseRoute)
app.use('/admin',adminRoute)
app.use('/auth',authRoute)

const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Map();
// setInterval(() => {
//   console.log(
//     onlineUsers
//   );
  
// }, 5000);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  console.log("auth ---------------->", socket.handshake.auth);
  
  const userId = socket.handshake.auth.userId;
  if (userId) {
    console.log("User ID received:", userId);
    onlineUsers.set(userId, socket.id);
    onlineUsers.set(socket.id, userId);
  } else {
    console.log("No user ID received");
  }

  socket.on("add-user", (userId) => {
    console.log("User added to onlineUsers map:", userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("Sending message:", data.msg, "To:", sendUserSocket);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    } else {
      console.log("Recipient socket not found for user:", data.to);
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      onlineUsers.delete(socket.id);
    }
  });
});




