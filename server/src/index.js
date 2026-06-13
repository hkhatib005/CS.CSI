import "dotenv/config";
import express from "express";
import cors from "cors";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

// In production, serve the built React client from the same process
if (process.env.NODE_ENV === "production") {
  const dist = join(__dirname, "../../client/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`🐬 Dolphin Planner API on http://localhost:${port}`));
