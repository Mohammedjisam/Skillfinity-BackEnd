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
const { Server } = require("socket.io");

const cookieParser=require("cookie-parser")
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', 
    credentials: true,
  }
});

app.use (express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(cors(
    {origin: 'http://localhost:5173',
      credentials: true,}
  ))

  mongoose.connect("mongodb://localhost:27017/Skillfinity")

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
  
app.use("/user",userRoute)
app.use("/user/data",dataRoutes)
app.use("/tutor",tutorRoute)
app.use("/tutor/course",courseRoute)
app.use('/admin',adminRoute)
app.use('/auth',authRoute)



io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("sendMessage", (message) => {
    console.log("Received message:", message);
    io.emit("receiveMessage", message); 
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});