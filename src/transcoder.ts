import fs from "node:fs";
import path from "node:path";
import type { Song } from "@prisma/client";
import FluentFfmpeg from "fluent-ffmpeg";

import { CACHE_DIRECTORY } from "./cache";

export function transcode(
  song: Song,
  bitrate: number,
  hlsTime: number = 30
): Promise<string> {
  const playlistFilename = `${song.id}-${bitrate}kbps.m3u8`;

  const songFolder = path.join(CACHE_DIRECTORY, song.id.toString());
  const bitrateFolder = path.join(songFolder, `${bitrate}kbps`);
  const playlistFile = path.join(bitrateFolder, playlistFilename);

  const hasSongFolder = fs.existsSync(songFolder);
  const hasBitrateFolder = fs.existsSync(bitrateFolder);

  // Check if we have already done this transcoding.
  // - Verify if we have `${CACHE_DIRECTORY}/${song.id}` folder.
  // - Verify if we have `${CACHE_DIRECTORY}/${song.id}/${bitrate}kbps` folder.
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
      .audioCodec("libmp3lame")
      .audioBitrate(bitrate)
      .addOutputOption([`-hls_time ${hlsTime}`, "-hls_list_size 0"])
      .save(playlistFile);
  });
}
