FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Match the version used to generate pnpm-lock.yaml. Build permissions for
# native packages are declared in pnpm-workspace.yaml.
RUN apk add --no-cache libc6-compat && npm install -g pnpm@11.25.0

WORKDIR /app

# Copy package manifests, build config, and ALL dialect templates so the
# postinstall hook can stamp out a matching schema.ts during install.
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml vite.config.ts ./
COPY scripts/db-setup.mjs scripts/db-setup.mjs
COPY src/config/db/schema.sqlite.ts src/config/db/schema.sqlite.ts
COPY src/config/db/schema.postgres.ts src/config/db/schema.postgres.ts
COPY src/config/db/schema.mysql.ts src/config/db/schema.mysql.ts

# DATABASE_PROVIDER must be set at build time so prebuild / postinstall pick
# the matching schema template. Pass it via `docker build --build-arg
# DATABASE_PROVIDER=postgresql` or set in your CI / k8s build pipeline.
ARG DATABASE_PROVIDER=postgresql
ENV DATABASE_PROVIDER=${DATABASE_PROVIDER}

# Railway exposes service variables as Docker build arguments. Declare the
# public Vite values explicitly so production links and metadata are baked
# into the client bundle.
ARG VITE_APP_URL
ARG VITE_APP_NAME
ARG VITE_APP_DESCRIPTION
ARG VITE_DEFAULT_LOCALE=en
ENV VITE_APP_URL=${VITE_APP_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION}
ENV VITE_DEFAULT_LOCALE=${VITE_DEFAULT_LOCALE}

RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

# NODE_ENV=production so loadEnvFiles() in vite.config.ts reads .env.production
ENV NODE_ENV=production

COPY . .
RUN pnpm build

# Production image — run the nitro server output
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache ffmpeg ca-certificates && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/data/generated && \
    chown -R appuser:nodejs /app/data

COPY --from=builder --chown=appuser:nodejs /app/.output ./.output

# Keep the migration tooling in the image so Railway can initialize and
# upgrade PostgreSQL over its private network before each release starts.
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=appuser:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=appuser:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=appuser:nodejs /app/scripts ./scripts
COPY --from=builder --chown=appuser:nodejs /app/src ./src

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV FFMPEG_PATH=/usr/bin/ffmpeg

CMD ["sh", "-c", "./node_modules/.bin/tsx scripts/with-env.ts ./node_modules/.bin/drizzle-kit migrate --config=drizzle.config.ts && ./node_modules/.bin/tsx scripts/with-env.ts ./node_modules/.bin/tsx scripts/init-rbac.ts && if [ -n \"$BOOTSTRAP_ADMIN_EMAIL\" ]; then ./node_modules/.bin/tsx scripts/with-env.ts ./node_modules/.bin/tsx scripts/assign-role.ts --email=$BOOTSTRAP_ADMIN_EMAIL --role=settings_manager; fi && exec node .output/server/index.mjs"]
