FROM node:20-alpine

WORKDIR /app

# Install dependencies using Yarn
COPY package.json yarn.lock ./
# We use --frozen-lockfile to ensure reproducible builds
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Access port
EXPOSE 9000

# Start command
CMD ["yarn", "start"]
