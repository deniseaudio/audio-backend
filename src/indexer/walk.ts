import path from "node:path";
import walk, { type WalkStatEventCallback } from "walk";
import { parseFile } from "music-metadata";

import { prisma } from "../prisma";

const BLACKLISTED_DIRS = ["@eaDir"];

const onWalkDirectory: WalkStatEventCallback = async (
  root,
  fileStats,
  next
) => {
  const directoryName = fileStats.name;
  const directoryPath = path.join(root, directoryName);

  const isBlacklisted =
    BLACKLISTED_DIRS.findIndex((d) =>
      directoryPath.toLowerCase().includes(d.toLowerCase())
    ) > -1;

  if (isBlacklisted || fileStats.isSymbolicLink()) {
    next();
    return;
  }

  const parentDirectory = await prisma.directory.findUnique({
    where: { path: root },
  });

  if (!parentDirectory) {
    next();
    return;
  }

  const directory = await prisma.directory.upsert({
    create: {
      name: directoryName,
      path: directoryPath,
      parent: { connect: { id: parentDirectory.id } },
    },
    update: {},
    where: { path: directoryPath },
  });

  console.log("[Indexer] Indexed directory:", directory.name);

  next();
};

const onWalkFile: WalkStatEventCallback = async (root, fileStats, next) => {
  const fileName = fileStats.name;
  const filePath = path.join(root, fileName);
  const fileExtension = path.extname(fileName);

  if (![".mp3", ".flac"].includes(fileExtension)) {
    next();
    return;
  }

  const metadata = await parseFile(filePath);

  const directory = await prisma.directory.findUnique({
    where: { path: root },
  });

  if (!directory) {
    next();
    return;
  }

  await prisma.song.upsert({
    create: {
      title: metadata.common.title || fileName,
      length: metadata.format.duration || 0,
      codec: metadata.format.codec || "Unknown",
      filename: fileName,
      path: filePath,
      directory: { connect: { id: directory.id } },
    },
    update: {},
    where: { path: filePath },
  });

  console.log("[Indexer] Indexed file:", fileName);

  next();
};

export async function walkRootDirectory(rootDirectoryPath: string) {
  const foldername = rootDirectoryPath.split(path.sep).pop()!;

  const directory = await prisma.directory.upsert({
    create: { name: foldername, path: rootDirectoryPath, root: true },
    update: {},
    where: { path: rootDirectoryPath },
  });

  console.log("[Indexer] Indexed root directory:", directory.name);

  return new Promise((resolve) => {
    const walker = walk.walk(rootDirectoryPath, { followLinks: false });

    walker.on("directory", onWalkDirectory);
    walker.on("file", onWalkFile);
    walker.on("end", () => resolve(true));
  });
}
