import express from "express";
import {
  Register,
  Login,
  Logout,
  googleLogin,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(Register);
router.route("/login").post(Login);
router.route("/logout").get(Logout);

// For googleLogin
router.route("/google").get(googleLogin);

export default router;
