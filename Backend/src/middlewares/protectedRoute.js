import jwt from "jsonwebtoken";

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const verifyToken = await jwt.verify(token, process.env.TOKEN_SECRET);
    if (!verifyToken) {
      return res.status(401).json({
        message: "Invalid Tokens",
        success: false,
      });
    }

    req.id = verifyToken.userId || verifyToken.id;
    next();
  } catch (error) {
    console.log("Token not found", error);
  }
};

export default protectedRoute;
