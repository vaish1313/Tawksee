// src/utils/socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("funkychat-token"),
  },
  autoConnect: false,
});

export default socket;
