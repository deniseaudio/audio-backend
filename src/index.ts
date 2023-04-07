import dotenv from "dotenv";

import { app } from "./api/express";
import { walkRootDirectory } from "./indexer/walk";

dotenv.config();

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
