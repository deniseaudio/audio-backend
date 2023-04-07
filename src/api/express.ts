import fs from "node:fs";
import path from "node:path";
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import bodyparser from "body-parser";
import morgan from "morgan";

import { songsRouter } from "./songs/songs.routes";
import { transcodeRouter } from "./transcode/transcode.routes";

export const app = express();
const router = Router();

const logFolderpath = path.join(__dirname, "../../.logs");
const logFilename = "api.log";
const logFilepath = path.join(logFolderpath, logFilename);

// Create log folder and file if they don't exist.
if (!fs.existsSync(logFolderpath)) {
  fs.mkdirSync(logFolderpath, { recursive: true });
  fs.openSync(path.join(logFolderpath, logFilename), "a");
}

app.use(express.json());
app.use(helmet());
app.use(bodyparser.json());

app.use(cors());
app.use(morgan("dev"));

// In production, log Express REST-API requests into a logfile.
if (process.env.NODE_ENV === "production") {
  app.use(
    morgan("combined", {
      stream: fs.createWriteStream(logFilepath, { flags: "a" }),
    })
  );
}

router.use("/songs", songsRouter);
router.use("/transcode", transcodeRouter);

app.get("/", async (req, res) => {
  res.send("It's working ✨");
});

app.use("/api", router);
