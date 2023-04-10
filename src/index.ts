/* eslint import/first: "off" */
import dotenv from "dotenv";

// Make sure to load the environment variables before importing any other file.
dotenv.config();

import { app } from "./api/express";
import { walkRootDirectory } from "./indexer/walk";

app.listen(3000, () => {
  console.log("🚀 Server ready at: localhost:3000");

  if (!process.env.ROOT_DIRECTORY) {
    console.error(
      "ROOT_DIRECTORY environment variable is not set, indexing will be disabled."
    );
  } else {
    walkRootDirectory(process.env.ROOT_DIRECTORY);
  }
});
