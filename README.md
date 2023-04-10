# Denise-Audio server

> Denise-Audio is a self-hosted music streaming server. Built with Node.js, TypeScript, Express and Prisma.

## Running the server with Docker

**Note**: if you want to host in production inside a DigitalOcean Droplet, I like to use [this guide](https://flaviocopes.com/how-to-self-host-plausible-analytics/) to setup a basic Docker-based Droplet with Nginx & Let's Encrypt SSL. Make sure to adjust specific parts of the guide and skip everything related to `docker-compose` _(we're using a single Docker image here)_.

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

  - `-v /Users/example/Desktop/Music`: the path to the music directory on the host machine, this will be mounted as a volume in the container.
  - `-p 3003:3000`: the port to expose on the host machine. **Note**: if using with Nginx, use `127.0.0.1:8000:3000`.

  ```shell
  docker run -p 3003:3000 \
    --restart=on-failure \
    -v /Users/example/Desktop/Music:/usr/src/app/media \
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

DigitalOcean Spaces can be used to store the music files.

1. Follow this tutorial to create a Space, generate API keys and mount the remote Space folder into your Droplet: https://simplebackups.com/blog/mounting-digitalocean-spaces-and-access-bucket-from-droplet/

  - To mount the remote Space folder into the Droplet:

    ```
    s3fs denisemedia /media/denisemedia \
      -o passwd_file=${HOME}/.passwd-s3fs \
      -o url=https://fra1.digitaloceanspaces.com/ \
      -o use_path_request_style
    ```

2. Restart the Docker image and edit the exposed volume by pointing it to the mounted DigitalOcean Spaces volume:

  ```shell
  docker run -p 3003:3000 \
    --restart=on-failure \
    -v /media/denisemedia:/usr/src/app/media \
    -d totominc/deniseaudio-backend
  ```
