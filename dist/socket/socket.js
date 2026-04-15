"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const events_1 = require("./events");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });
    io.on("connect", (socket) => {
        console.log("🟢 User connected:", socket.id);
        io.emit("backend-connect", "HEY BRO AMI BACKEND");
        (0, events_1.socketEvents)(socket, io);
        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
// optional: export io to use anywhere
const getIO = () => {
    if (!io)
        throw new Error("Socket not initialized!");
    return io;
};
exports.getIO = getIO;
