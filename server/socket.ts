import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for a new message
  socket.on("sendMessage", (message) => {
    console.log("New message:", message);
    io.emit("newMessage", message); // Send message to all clients
  });

  // Listen for typing event
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
