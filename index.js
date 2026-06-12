import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`🐬 Dolphin Planner API on http://localhost:${port}`));
