import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketEvents } from "./events";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // FIX
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
    io.emit("backend-connect", "HEY BRO AMI BACKEND");
    socketEvents(socket, io);
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  return io;
};

// optional: export io to use anywhere
export const getIO = () => {
  if (!io) throw new Error("Socket not initialized!");
  return io;
};
