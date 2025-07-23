// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") },
  transports: ["websocket"], // optional, but ensures real-time connection
});

export default socket;
