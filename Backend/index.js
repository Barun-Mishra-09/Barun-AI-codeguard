import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import app from "./src/app.js";
import connectDB from "./src/utils/db.js";
import path from "path";

dotenv.config();

const _dirname = path.resolve();

// ✅ MIDDLEWARES
app.use(express.json());

app.use(
  cors({ 
    origin: "http://localhost:5173" || "https://barun-ai-codeguard-r5an.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// serve frontend file
app.use(express.static(path.join(_dirname, "/Frontend/dist")));
app.use((req, res) => {
  res.sendFile(path.resolve(_dirname, "Frontend", "dist", "index.html"));
});

// ✅ START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running at port ${PORT}`);
});
