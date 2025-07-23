function socketHandler(io, socket) {
  console.log("User connected:", socket.id);

  // Store the current user's ID (extracted from auth or client emit)
  let currentUserId = null;

  // Handle joining a room
  socket.on("join-room", ({ chatId, userId }) => {
    currentUserId = userId;
    socket.join(chatId);
    console.log(`User ${userId} joined room ${chatId}`);

    // Notify other users in the room
    socket.to(chatId).emit("user-joined", { userId, chatId });

    // Track online users (optional - for global list)
    const onlineUsers = Array.from(io.sockets.sockets.values())
      .map((s) => s.handshake.auth?.token || s.userId)
      .filter(Boolean);

    io.emit("users-online", onlineUsers);
  });

  // Handle leaving a room
  socket.on("leave-room", ({ chatId, userId }) => {
    socket.leave(chatId);
    console.log(`User ${userId} left room ${chatId}`);
    socket.to(chatId).emit("user-left", { userId, chatId });
  });

  // Handle incoming messages
  socket.on("send-message", (data) => {
    const { chatId } = data;
    socket.to(chatId).emit("receive-message", data); // Broadcast to others in the room
  });

  // Handle typing events
  socket.on("typing", ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit("typing", { chatId, userId, isTyping });
  });

  // Handle reactions
  socket.on("message-reaction", ({ messageId, chatId, userId, emoji }) => {
    socket.to(chatId).emit("message-reaction", {
      messageId,
      chatId,
      userId,
      emoji,
    });
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Optionally broadcast user offline status
    if (currentUserId) {
      io.emit("user-left", { userId: currentUserId });
    }
  });
}

module.exports = { socketHandler };
