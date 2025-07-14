# Stage 1: Install and build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies (for native modules)
RUN apk add --no-cache python3 make g++ git

# Copy dependency definitions first for better caching
COPY package*.json ./

# First run npm install to sync package.json and package-lock.json
# Then run npm ci for clean install
RUN --mount=type=cache,target=/root/.npm \
    npm install && \
    npm ci

# Copy the rest of the source and compile
COPY . .
RUN npm run build

# Stage 2: Setup runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Environment variables
ENV NODE_ENV=production \
    MONGO_URI=mongodb://mongo:27017/mydb \
    REDIS_HOST=redis \
    REDIS_PORT=6379

# Copy production dependencies and build output
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose application port
EXPOSE 3000

# Start the NestJS app
CMD ["node", "dist/main.js"]