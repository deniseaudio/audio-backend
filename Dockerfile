FROM node:18-alpine

ARG GITHUB_NPM_TOKEN
ARG DATABASE_URL
ARG MUSIC_DIRECTORY

# Create app directory.
WORKDIR /usr/src/app

# Prepare image with ffmpeg.
RUN apk update
RUN apk add
RUN apk add ffmpeg

# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Pass a private NPM token to the container.
RUN echo "//npm.pkg.github.com/:_authToken=$GITHUB_NPM_TOKEN" >> .npmrc

# Install dependencies.
RUN npm install --loglevel verbose

# Copy app source code.
COPY prisma/ ./prisma/
COPY src/ ./src/
COPY tsconfig.json ./

# Pass environment variables to the container, using --build-arg.
RUN echo "DATABASE_URL=$DATABASE_URL" >> .env
RUN echo "ROOT_DIRECTORY=$MUSIC_DIRECTORY" >> .env

# Generate Prisma artifacts and client.
RUN npm run prisma:generate

# Deploy Prisma schema and apply migrations.
RUN npm run prisma:deploy

# Compile source code.
RUN npm run build

# Make sure the container runs in production mode.
# This should not be set before the installation of dependencies, as it will
# not install devDependencies.
ENV NODE_ENV=production

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
