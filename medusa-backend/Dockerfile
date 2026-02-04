FROM node:20-alpine

WORKDIR /app/medusa

COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

# Build the admin UI (if applicable) and backend
RUN npm run build

# Expose port
EXPOSE 9000

# Start command (runs migrations then starts server)
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
