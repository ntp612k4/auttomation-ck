const express = require("express");
const cors = require("cors");
require("dotenv").config();
const apiRoutes = require("./routes/api");

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Khởi động server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend API đang chạy trên http://localhost:${PORT}`);
});
