# Denise-Audio server

> Denise-Audio is a self-hosted music streaming server. Built with Node.js, TypeScript, Express and Prisma.

## Running the server with Docker

**Note**: if you want to host in production inside a DigitalOcean Droplet, I like to use [this guide](https://flaviocopes.com/how-to-self-host-plausible-analytics/) to setup a basic Docker-based Droplet with Nginx & Let's Encrypt SSL. Make sure to adjust specific parts of the guide and skip everything related to `docker-compose` _(we're using a single Docker image here)_.

1. Build the Docker image with build-args:

  - `GITHUB_NPM_TOKEN`: the GitHub token to access private npm packages _(used for a custom ESLint config)_.
  - `DATABASE_URL`: the database URL, can be a file path (`file:./dev.db`) or a remote URL.
  - `MUSIC_DIRECTORY`: the path to the music directory **in the container**.
  - `CACHE_DIRECTORY`: the path to the cache directory **in the container**.
  - `INDEXER_IGNORE_PATTERN`: comma-separated list of directory patterns to ignore when indexing the music directory.

  ```shell
  docker build \
    --build-arg GITHUB_NPM_TOKEN='${TOKEN}' \
    --build-arg DATABASE_URL='file:./dev.db' \
    --build-arg MUSIC_DIRECTORY='/usr/src/app/media' \
    --build-arg CACHE_DIRECTORY="/usr/src/app/.cache" \
    --build-arg INDEXER_IGNORE_PATTERN=".cache" \
    -t totominc/deniseaudio-backend \
    .
  ```

2. Run the Docker image:

  - `-v /media/denisemedia-music:/usr/src/app/media`: expose `/media/denisemedia-music`, can be accessed with `/usr/src/app/media` inside the container _(used as env. var. in --build-arg)_.
  - `-v /media/denisemedia-cache:/usr/src/app/.cache`: expose `/media/denisemedia-cache`, can be accessed with `/usr/src/app/.cache` inside the container _(used as env. var. in --build-arg)_.
  - `-p 3003:3000`: the port to expose on the host machine. **Note**: if using a reverse-proxy with **Nginx**, use `127.0.0.1:8000:3000`.

  ```shell
  docker run -p 3003:3000 \
    --restart=on-failure \
    -v /media/denisemedia-music:/usr/src/app/media \
    -v /media/denisemedia-cache:/usr/src/app/.cache \
    -d totominc/deniseaudio-backend
  ```

3. `docker ps` to check if the container is running.

## Running locally (without Docker)

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

## Volume storage with DigitalOcean Spaces

DigitalOcean Spaces can be used to store the music and cache files.

1. Create `Music` and `Cache` folders inside Space using DigitalOcean Spaces dashboard.

2. Follow this tutorial to create a Space, generate API keys and mount the remote Space folder into your Droplet: https://simplebackups.com/blog/mounting-digitalocean-spaces-and-access-bucket-from-droplet/

  - Mount the `Music` folder as `/media/denisemedia-music` inside your Droplet:

    ```
    s3fs denisemedia:/Music /media/denisemedia-music -o passwd_file=${HOME}/.passwd-s3fs -o url=https://fra1.digitaloceanspaces.com/ -o use_path_request_style
    ```

  - Mount the `Cache` folder as `/media/denisemedia-cache` inside your Droplet:

    ```
    s3fs denisemedia:/Cache /media/denisemedia-cache -o passwd_file=${HOME}/.passwd-s3fs -o url=https://fra1.digitaloceanspaces.com/ -o use_path_request_style
    ```

3. Restart the Docker image and edit the exposed volume by pointing it to the mounted DigitalOcean Spaces volume:

  ```shell
  docker run -p 127.0.0.1:8000:3000 \
    --restart=on-failure \
    -v /media/denisemedia-music:/usr/src/app/media \
    -v /media/denisemedia-cache:/usr/src/app/.cache \
    -d totominc/deniseaudio-backend
  ```
