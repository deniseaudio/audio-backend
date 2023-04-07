import { Router } from "express";

import { prisma } from "../../prisma";

const router = Router();

router.route("/").get(async (req, res) => {
  const songs = await prisma.song.findMany();

  res.send(songs);
});

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;

  const song = await prisma.song.findUnique({
    where: { id: parseInt(id, 10) },
  });

  res.send(song);
});

export { router as songsRouter };
