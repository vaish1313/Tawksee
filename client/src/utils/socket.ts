// src/utils/socket.ts
import { io } from "socket.io-client";

const socket = io("https://tawksee.onrender.com", {
  auth: {
    token: localStorage.getItem("funkychat-token"),
  },
  autoConnect: false,
});

export default socket;
