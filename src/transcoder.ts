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
  const playlistFile = path.join(
    CACHE_DIRECTORY,
    `${song.id}-${bitrate}kbps.m3u8`
  );

  const hasPlaylistFile = fs.existsSync(playlistFile);

  // Check if we have already done this transcoding.
  if (hasPlaylistFile) {
    return Promise.resolve(playlistFile);
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
