import fs from "node:fs";
import path from "node:path";
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import bodyparser from "body-parser";
import morgan from "morgan";

import { CACHE_DIRECTORY } from "../cache";
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

app.get("/stream/:songId/:bitrate/:fileName", async (req, res) => {
  const { songId, bitrate, fileName } = req.params;

  if (!songId || !bitrate) {
    res.status(400).send("Invalid request");
    return;
  }

  const songPath = path.join(
    CACHE_DIRECTORY,
    fileName === "playlist" ? `${songId}-${bitrate}kbps.m3u8` : fileName
  );

  if (!fs.existsSync(songPath)) {
    res.status(404).send("Song not found, please transcode it first.");
    return;
  }

  res.status(200).sendFile(songPath);
});

app.use("/api", router);
