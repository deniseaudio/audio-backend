import { Router } from "express";

import { prisma } from "../../prisma";
import { transcode } from "../../transcoder";

const router = Router();

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  const { bitrate } = req.query;

  if (
    bitrate &&
    (typeof bitrate !== "string" || Number.isNaN(parseInt(bitrate, 10)))
  ) {
    res.status(400).send("Invalid bitrate");
    return;
  }

  const song = await prisma.song.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!song) {
    res.status(404).send("Song not found");
    return;
  }

  const transcodedFilePath = await transcode(song, 128);

  res.status(200).json({ hlsPlaylistFilePath: transcodedFilePath });
});

export { router as transcodeRouter };
