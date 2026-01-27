import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import fs from "fs";
import { upload } from "../middlewares/upload.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { UPLOAD_ERRORS, DOCUMENT_ERRORS } from "../constants/errors.js";
import Document from "../models/Document.js";

const router = Router();

router.use(requireApiKey);

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

router.get("/:documentId", async (req, res) => {
  const { documentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({
      success: false,
      message: DOCUMENT_ERRORS.INVALID_ID
    });
  }

  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: DOCUMENT_ERRORS.NOT_FOUND
    });
  }

  res.json({
    success: true,
    data: document
  });
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
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
