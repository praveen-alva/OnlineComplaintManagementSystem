import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  withCredentials: true,
  autoConnect: true
});

export default socket;