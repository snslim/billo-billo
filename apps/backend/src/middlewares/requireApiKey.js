import { AUTH_ERRORS } from "../constants/errors.js";

export function requireApiKey(req, res, next) {
  const apiKey = req.headers["api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: AUTH_ERRORS.UNAUTHORIZED
    });
  }

  next();
}
