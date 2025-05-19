FROM node:18-alpine AS base

# Install dependencies and build
FROM base AS builder
WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm ci
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install cron and setup directories
RUN apk add --no-cache dcron

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/package* ./

# Create log file and set permissions
RUN touch /app/cron.log && \
    chown nextjs:nodejs /app/cron.log && \
    chmod 644 /app/cron.log

# Copy the start script and make it executable
COPY start.sh ./
RUN chmod +x start.sh && chmod +x ./scripts/_run-cron-test.sh

# Set up crontab
RUN mkdir -p /etc/crontabs && \
    echo "* * * * * cd /app && su -s /bin/sh nextjs -c './scripts/_run-cron-test.sh' >> /app/cron.log 2>&1" > /etc/crontabs/root && \
    chmod 600 /etc/crontabs/root

USER root

EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
