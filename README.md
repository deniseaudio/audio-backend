# Denise-Audio server

> Denise-Audio is a self-hosted music streaming server. Built with Node.js, TypeScript, Express and Prisma.

## Running the server with Docker

1. Build the Docker image with build-args:

  - `GITHUB_NPM_TOKEN`: the GitHub token to access private npm packages (used for a custom ESLint config).
  - `DATABASE_URL`: the database URL, can be a file path (`file:./dev.db`) or a remote URL.
  - `MUSIC_DIRECTORY`: the path to the music directory **in the container**.

  ```shell
  docker build \
    --build-arg GITHUB_NPM_TOKEN='${TOKEN}' \
    --build-arg DATABASE_URL='file:./dev.db' \
    --build-arg MUSIC_DIRECTORY='/usr/src/app/media' \
    -t totominc/deniseaudio-backend \
    .
  ```

2. Run the Docker image:

  - `/Users/example/Desktop/Music`: the path to the music directory on the host machine, this will be mounted as a volume in the container.

  ```shell
  docker run -p 3003:3000 \
    --restart=on-failure
    -v /Users/example/Desktop/Music:/usr/src/app/media \
    -d totominc/deniseaudio-backend
  ```

3. `docker ps` to check if the container is running.

## Running locally

1. Install dependencies:

  ```shell
  npm install
  ```

2. Copy the `.env.example` file to `.env` and fill in the values.

  ```shell
  cp .env.example .env
  ```

3. Generate the Prisma client and apply migrations:

  ```shell
  npm run prisma:deploy && npm run prisma:generate
  ```

4. Run the server:

  ```shell
  npm run dev
  ```
