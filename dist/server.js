"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const config_1 = require("./config");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_1 = require("./socket/socket");
let server;
const port = config_1.Config.PORT;
// ✅ Register error handlers FIRST
process.on("uncaughtException", (err) => {
    console.error("😈 uncaughtException detected, shutting down...", err);
    if (server) {
        server.close(() => process.exit(1));
    }
    else {
        process.exit(1);
    }
});
process.on("unhandledRejection", (err) => {
    console.error("😈 unhandledRejection detected, shutting down...", err);
    if (server) {
        server.close(() => process.exit(1));
    }
    else {
        process.exit(1);
    }
});
async function main() {
    try {
        // ✅ Await the connection + use Config for URI
        await mongoose_1.default.connect(config_1.Config.DATABASE_URL);
        console.log("✅ Database connected successfully");
        server = (0, http_1.createServer)(app_1.default);
        // ✅ STEP 2: attach socket BEFORE listen
        (0, socket_1.initSocket)(server);
        // ✅ STEP 3: start server
        server.listen(port, () => {
            console.log(`Server running on ${port}`);
        });
    }
    catch (error) {
        console.error("Error starting server:", error);
        process.exit(1); // ✅ Exit if startup fails
    }
}
main();
