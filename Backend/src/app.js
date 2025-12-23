import express from "express";

import aiRoutes from "../src/routes/ai.routes.js";
import userRoute from "../src/routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ MUST be before routes

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.options("*", cors());

// use of middlewares
app.use("/ai", aiRoutes);
app.use("/api/v1/user", userRoute);

// app.get("/", (req, res) => {
//   res.send("Hello Barun sir!, How are you?");
// });
export default app;
