const express = require("express");
const app = express();
const socket = require("socket.io");
const cors = require("cors");
const { getCurrentUser, userLeave, userJoin } = require("./user");

const port = 8000;

// Configure CORS to allow requests from the React app
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));

let server = app.listen(
  port,
  console.log(
    `Server is running on port ${port}`
  )
);

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }
});

io.on("connection", (socket) => {
  // When a new user joins a room
  socket.on("joinRoom", ({ username, roomname }) => {
    const user = userJoin(socket.id, username, roomname);
    console.log(socket.id, "=id");
    socket.join(user.room);

    //welcome message to make sure connection is established correctly
    socket.emit("message", {
      userId: user.id,
      username: user.username,
      text: `Welcome ${user.username}`,
    });

    socket.broadcast.to(user.room).emit("message", {
      userId: user.id,
      username: user.username,
      text: `${user.username} has joined the chat`,
    });
  });

  socket.on("chat", (encryptedText) => {
    const user = getCurrentUser(socket.id);
    console.log(encryptedText, 'received a new message'); 
    io.to(user.room).emit("message", {
      userId: user.id,
      username: user.username,
      text: encryptedText,
    });
  });

  socket.on("disconnectUser", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        userId: user.id,
        username: user.username,
        text: `${user.username} left`,
      });
    }
  });
});
