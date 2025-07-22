function socketHandler(io, socket) {
  console.log("User connected:", socket.id);

  socket.on("send-message", (data) => {
    io.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}

module.exports = { socketHandler };
