import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import app from "./src/app.js";
import connectDB from "./src/utils/db.js";

dotenv.config();

// ✅ MIDDLEWARES
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running at port ${PORT}`);
});
