import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import {
  getDocument,
  updateDocument,
} from "./controller/document-controller.js";

//database config
await connectDB();
//configure env
dotenv.config();

const PORT = process.env.PORT || 8080;

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });
});
