import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorHandler);

export default app;
