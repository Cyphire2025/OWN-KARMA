FROM node:20-alpine

WORKDIR /app

# Install dependencies using Yarn
# Adjust path to look inside ownkarma-backend folder
COPY ownkarma-backend/package.json ownkarma-backend/yarn.lock ./
# We use --frozen-lockfile to ensure reproducible builds
RUN yarn install --frozen-lockfile

# Copy source code
COPY ownkarma-backend/ .

# Build the application
RUN yarn build

# Access port
EXPOSE 9000

# Start command
CMD ["yarn", "start"]
