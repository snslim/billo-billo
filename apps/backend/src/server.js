import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/mongoose.js";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
    });
  } catch (err) {
    console.error("서버 시작 실패:", err.message);
    process.exit(1);
  }
}

startServer();
