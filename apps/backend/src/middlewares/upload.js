import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_ERRORS } from "../constants/errors.js";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(UPLOAD_ERRORS.UNSUPPORTED_TYPE), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
