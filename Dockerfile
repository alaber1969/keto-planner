# ============================================
# KetoPlanner - Dockerfile
# Multi-stage build for production deployment
# ============================================

# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy config files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js components.json index.html ./
COPY src/ src/
COPY public/ public/

# Build the frontend
RUN pnpm build

# ---- Stage 2: Backend ----
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend files
COPY server/package.json server/package-lock.json* ./
RUN npm ci --production

# ---- Stage 3: Production ----
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy backend dependencies
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy backend code
COPY server/index.js ./
COPY server/ ./

# Copy built frontend from first stage
COPY --from=frontend-builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

EXPOSE 3001

CMD ["node", "index.js"]
