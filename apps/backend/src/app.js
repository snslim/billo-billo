import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);

app.use((req, res) => {
  res.status(404).json({ error: "요청한 리소스를 찾을 수 없습니다" });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "서버 내부 오류가 발생했습니다" });
});

export default app;
