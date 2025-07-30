const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

async function socketHandler(io, socket) {
  // Expect token in socket.handshake.auth.token
  const token = socket.handshake.auth && socket.handshake.auth.token;
  const payload = token && verifyToken(token);
  if (!payload || !payload.id) {
    socket.disconnect(true);
    return;
  }

  // Check user exists in DB
  const user = await User.findById(payload.id);
  if (!user) {
    socket.disconnect(true);
    return;
  }

  const currentUserId = user._id.toString();

  // Handle joining a room
  socket.on('join-room', async ({ chatId, userId }) => {
    // Only allow if userId matches token
    if (userId !== currentUserId) return;
    socket.join(chatId);
    socket.to(chatId).emit('user-joined', { userId, chatId });
    // Track online users
    const onlineUsers = Array.from(io.sockets.sockets.values())
      .map((s) => s.handshake.auth?.token && verifyToken(s.handshake.auth.token)?.id)
      .filter(Boolean);
    io.emit('users-online', onlineUsers);
  });

  // Handle leaving a room
  socket.on('leave-room', ({ chatId, userId }) => {
    if (userId !== currentUserId) return;
    socket.leave(chatId);
    socket.to(chatId).emit('user-left', { userId, chatId });
  });

  // Handle incoming messages
  socket.on('send-message', async (data) => {
    // Only allow if sender is current user and all recipients exist
    if (data.senderId !== currentUserId) return;
    // Optionally, check all participants in chat exist
    // (Assume chatId is valid and participants are checked elsewhere)
    socket.to(data.chatId).emit('receive-message', data);
  });

  // Handle typing events
  socket.on('typing', ({ chatId, userId, isTyping }) => {
    if (userId !== currentUserId) return;
    socket.to(chatId).emit('typing', { chatId, userId, isTyping });
  });

  // Handle reactions
  socket.on('message-reaction', ({ messageId, chatId, userId, emoji }) => {
    if (userId !== currentUserId) return;
    socket.to(chatId).emit('message-reaction', {
      messageId,
      chatId,
      userId,
      emoji,
    });
  });

  // On disconnect
  socket.on('disconnect', () => {
    io.emit('user-left', { userId: currentUserId });
  });
}

module.exports = { socketHandler };
