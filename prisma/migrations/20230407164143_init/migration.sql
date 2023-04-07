-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Directory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "root" BOOLEAN NOT NULL DEFAULT false,
    "parentId" INTEGER,
    CONSTRAINT "Directory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Directory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "length" REAL NOT NULL,
    "filename" TEXT NOT NULL,
    "codec" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "directoryId" INTEGER NOT NULL,
    CONSTRAINT "Song_directoryId_fkey" FOREIGN KEY ("directoryId") REFERENCES "Directory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Directory_path_key" ON "Directory"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Song_path_key" ON "Song"("path");
