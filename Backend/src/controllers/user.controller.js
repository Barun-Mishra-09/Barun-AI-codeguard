import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

export const Register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Some fields are empty, so fill and try again",
        success: false,
      });
    }

    // Email Format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already registered with this Email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 11);

    // New user create
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Generate JWT Token
    const tokenData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "12h",
    });

    const saferUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    return res
      .status(201)
      .cookie("token", token, {
        maxAge: 12 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        // //   secure in production
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        message: `${user.firstName} created account Successfully`,
        success: true,
        user: saferUser,
      });
  } catch (err) {
    console.error("User logging error", err);
    return res.status(500).json({
      message: "Internal Server Error. Please try again later.",
      success: false,
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Some fields are missing, so fill it and try again later",
        success: false,
      });
    }

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existedUser.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    // Generate token and check tokenData
    const tokenData = {
      userId: existedUser._id,
    };

    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "12h",
    });

    // ✅ LOG HERE (this will appear in VS Code terminal)
    console.log(
      `✅ LOGIN SUCCESS | User: ${
        existedUser.email
      } | Time: ${new Date().toLocaleString()}`
    );
    const saferUser = {
      id: existedUser._id,
      firstName: existedUser.firstName,
      lastName: existedUser.lastName,
      email: existedUser.email,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 12 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${saferUser.firstName}`,
        success: true,
        user: saferUser,
      });
  } catch (error) {
    console.error(error);
  }
};

export const Logout = async (req, res) => {
  return res
    .status(200)
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// Function for googleLogin

export const googleLogin = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "postmessage";

    // 1️⃣ Exchange code for token
    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",
      tokenParams,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenData;

    // 2️⃣ Fetch Google user
    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { given_name, family_name, name, email } = googleUser;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not available from Google",
      });
    }

    // ✅ FINAL SAFE NAME NORMALIZATION
    const firstName =
      given_name?.trim() || name?.trim().split(" ")[0] || "User";

    let lastName =
      family_name?.trim() || name?.trim().split(" ").slice(1).join(" ");

    if (!lastName || lastName.length === 0) {
      lastName = "NA"; // 🔥 REQUIRED FIELD GUARANTEE
    }

    // 3️⃣ Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: "google-auth", // dummy
      });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "12h",
    });

    // 5️⃣ Send response
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 12 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Google login successful",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
