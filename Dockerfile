FROM node:20-alpine

WORKDIR /app

# Copy ALL backend source code first
# This ensures we have .yarnrc.yml, .npmrc, and everything else needed for a correct install
COPY ownkarma-backend/ .

# Install dependencies using Yarn
# We accept the loose lockfile to smooth over platform differences
RUN yarn install

# Build the application
RUN yarn build

# Access port
EXPOSE 9000

# Start command
CMD ["yarn", "start"]
