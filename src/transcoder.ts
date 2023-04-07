import fs from "node:fs";
import path from "node:path";
import type { Song } from "@prisma/client";
import FluentFfmpeg from "fluent-ffmpeg";

const CACHE_DIR = path.join(process.cwd(), ".cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

export function transcode(song: Song, bitrate: number): Promise<string> {
  const playlistFilename = `${song.id}-${bitrate}kbps.m3u8`;

  const songFolder = path.join(CACHE_DIR, song.id.toString());
  const bitrateFolder = path.join(songFolder, `${bitrate}kbps`);
  const playlistFile = path.join(bitrateFolder, playlistFilename);

  const hasSongFolder = fs.existsSync(songFolder);
  const hasBitrateFolder = fs.existsSync(bitrateFolder);

  // Check if we have already done this transcoding.
  // - Verify if we have `.cache/${song.id}` folder.
  // - Verify if we have `.cache/${song.id}/${bitrate}kbps` folder.
  if (hasSongFolder && hasBitrateFolder) {
    return Promise.resolve(path.join(bitrateFolder, playlistFilename));
  }

  if (!hasSongFolder) {
    fs.mkdirSync(songFolder);
  }

  if (!hasBitrateFolder) {
    fs.mkdirSync(bitrateFolder);
  }

  const ffmpeg = FluentFfmpeg();

  return new Promise((resolve, reject) => {
    ffmpeg
      .on("end", () => resolve(playlistFile))
      .on("error", (err) => reject(err))
      .input(song.path)
      .audioCodec("aac")
      .audioBitrate(bitrate)
      .addOutputOption(["-hls_time 30", "-hls_list_size 0"])
      .save(playlistFile);
  });
}
