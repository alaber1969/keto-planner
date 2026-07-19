# ============================================
# KetoPlanner - Single-stage Dockerfile
# ============================================

FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy all project files
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/package.json

# Install ALL dependencies (frontend + backend)
RUN pnpm install --no-frozen-lockfile
RUN cd server && npm install --production

# Copy source code
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js components.json index.html ./
COPY scripts/ scripts/
COPY src/ src/
COPY public/ public/
COPY server/ server/

# Build frontend
RUN pnpm build

# Production environment
ENV NODE_ENV=production
EXPOSE 3001

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/api/health || exit 1

CMD ["node", "server/index.js"]
