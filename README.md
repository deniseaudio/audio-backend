# Denise-Audio server

## Docker

1. Build the Docker image with build-args:
  ```shell
  docker build \
    --build-arg GITHUB_NPM_TOKEN='${TOKEN}' \
    --build-arg DATABASE_URL='file:./dev.db' \
    --build-arg MUSIC_DIRECTORY='/usr/src/app/media' \
    -t totominc/deniseaudio-backend \
    .
  ```

2. Run the Docker image:
  ```shell
  docker run -p 3003:3000 \
    -v /Users/example/Desktop/Music:/usr/src/app/media \
    -d totominc/deniseaudio-backend
  ```

3. `docker ps`
