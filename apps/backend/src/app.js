import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import healthRouter from "./routes/health.js";
import documentsRouter from "./routes/documents.js";
import { COMMON_ERRORS } from "./constants/errors.js";

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: COMMON_ERRORS.TOO_MANY_REQUESTS
  }
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/health", healthRouter);
app.use("/documents", documentsRouter);

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: COMMON_ERRORS.NOT_FOUND 
  });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: COMMON_ERRORS.SERVER_ERROR 
  });
});

export default app;
