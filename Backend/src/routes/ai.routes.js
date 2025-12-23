import express from "express";
import { aiGetReview } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/codeReview", aiGetReview);

export default router;
