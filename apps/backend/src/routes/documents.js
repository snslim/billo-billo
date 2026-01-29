import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import fs from "fs";
import { upload } from "../middlewares/upload.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import {
  UPLOAD_ERRORS,
  DOCUMENT_ERRORS,
  COMMON_ERRORS,
  PROCESS_ERRORS
} from "../constants/errors.js";
import {
  PIPELINE_STEPS,
  PIPELINE_STATUS,
  PARSING_STATUS,
  EVENT_ACTIONS
} from "../constants/pipeline.js";
import Document from "../models/Document.js";
import { parseInvoiceFields } from "../services/parseInvoiceFields.js";
import {
  SUPPORTED_MIME_TYPES,
  MAX_PARSING_ATTEMPTS,
  pushEvent,
  isTextSufficient,
  getEmptyParsingResult,
  runExtraction,
  handleInsufficientText
} from "../services/documentProcessor.js";

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
    if (req.file && req.file.path) {
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

router.post("/:documentId/process", async (req, res) => {
  const { documentId } = req.params;
  const force = req.query.force === "true" || (req.body && req.body.force === true);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({
      success: false,
      message: DOCUMENT_ERRORS.INVALID_ID
    });
  }

  try {
    const doc = await Document.findById(documentId);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: DOCUMENT_ERRORS.NOT_FOUND
      });
    }

    const status = doc.pipeline.overallStatus;
    if ((status === PIPELINE_STATUS.DONE || status === PIPELINE_STATUS.FAILED) && !force) {
      return res.status(409).json({
        success: false,
        message: PROCESS_ERRORS.ALREADY_PROCESSED
      });
    }

    const mimeType = doc.file.mimeType;
    if (!SUPPORTED_MIME_TYPES[mimeType]) {
      return res.status(400).json({
        success: false,
        message: PROCESS_ERRORS.UNSUPPORTED_FILE_TYPE
      });
    }

    doc.pipeline.overallStatus = PIPELINE_STATUS.PROCESSING;

    if (force) {
      doc.parsing = {
        status: null,
        attempts: 0,
        maxAttempts: MAX_PARSING_ATTEMPTS,
        result: getEmptyParsingResult(),
        meta: { reason: null, model: null }
      };
    }

    const filePath = doc.file.storagePath;
    const extractionResult = await runExtraction(doc, filePath, mimeType);

    if (!extractionResult.success) {
      await doc.save();
      return res.status(500).json({
        success: false,
        documentId,
        overallStatus: PIPELINE_STATUS.FAILED,
        reason: extractionResult.error
      });
    }

    if (!isTextSufficient(extractionResult.signals, extractionResult.text)) {
      handleInsufficientText(doc, extractionResult.isPdf);
      await doc.save();
      return res.status(200).json({
        success: false,
        documentId,
        overallStatus: PIPELINE_STATUS.FAILED,
        reason: PROCESS_ERRORS.EXTRACTION_TEXT_INSUFFICIENT
      });
    }

    doc.pipeline.currentStep = PIPELINE_STEPS.LLM_PARSE;
    const attempts = doc.parsing.attempts + 1;

    if (attempts > doc.parsing.maxAttempts) {
      return res.status(429).json({
        success: false,
        documentId,
        message: PROCESS_ERRORS.MAX_ATTEMPTS_EXCEEDED
      });
    }

    pushEvent(doc, { step: PIPELINE_STEPS.LLM_PARSE, action: EVENT_ACTIONS.START });

    const parseResult = await parseInvoiceFields(extractionResult.text);
    const parsingResult = parseResult.result || getEmptyParsingResult();

    doc.parsing = {
      status: parseResult.success ? PARSING_STATUS.SUCCESS : PARSING_STATUS.FAILED,
      attempts,
      maxAttempts: MAX_PARSING_ATTEMPTS,
      result: parsingResult,
      meta: { reason: parseResult.error || null, model: parseResult.model }
    };

    if (parseResult.success) {
      doc.pipeline.overallStatus = PIPELINE_STATUS.DONE;
      pushEvent(doc, { step: PIPELINE_STEPS.LLM_PARSE, action: EVENT_ACTIONS.SUCCESS });
      await doc.save();
      return res.status(200).json({
        success: true,
        documentId,
        overallStatus: PIPELINE_STATUS.DONE
      });
    }

    doc.pipeline.overallStatus = PIPELINE_STATUS.FAILED;
    pushEvent(doc, { step: PIPELINE_STEPS.LLM_PARSE, action: EVENT_ACTIONS.FAILED, reason: parseResult.error });
    await doc.save();
    return res.status(502).json({
      success: false,
      documentId,
      overallStatus: PIPELINE_STATUS.FAILED,
      reason: parseResult.error
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: COMMON_ERRORS.SERVER_ERROR
    });
  }
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
