import { createServer, Server } from "http";
import { Config } from "./config";
import app from "./app";
import mongoose from "mongoose";
import { initSocket } from "./socket/socket";

let server: Server;
const port = Config.PORT;

// ✅ Register error handlers FIRST
process.on("uncaughtException", (err) => {
  console.error("😈 uncaughtException detected, shutting down...", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  console.error("😈 unhandledRejection detected, shutting down...", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

async function main() {
  try {
    // ✅ Await the connection + use Config for URI
    await mongoose.connect(Config.DATABASE_URL as string);
    console.log("✅ Database connected successfully");
    server = createServer(app);

    // ✅ STEP 2: attach socket BEFORE listen
    initSocket(server);

    // ✅ STEP 3: start server
    server.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // ✅ Exit if startup fails
  }
}

main();
