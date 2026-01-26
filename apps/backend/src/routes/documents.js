import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { upload } from "../middlewares/upload.js";
import { UPLOAD_ERRORS } from "../constants/errors.js";
import Document from "../models/Document.js";

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: UPLOAD_ERRORS.FILE_REQUIRED
      });
    }

    const document = await Document.create({
      file: {
        storagePath: req.file.path,
        mimeType: req.file.mimetype,
        pageCount: 0
      }
    });

    res.status(201).json({
      success: true,
      data: { documentId: document._id }
    });
  } catch (err) {
    if (req.file?.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    console.error(err);
    res.status(500).json({
      success: false,
      message: UPLOAD_ERRORS.UPLOAD_FAILED
    });
  }
});

router.get("/:documentId", (req, res) => {
  res.json({ success: true, data: { ok: true } });
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: UPLOAD_ERRORS.FILE_TOO_LARGE
      });
    }
    return res.status(400).json({
      success: false,
      message: UPLOAD_ERRORS.UPLOAD_FAILED
    });
  }
  if (err.message === UPLOAD_ERRORS.UNSUPPORTED_TYPE) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
});

export default router;
