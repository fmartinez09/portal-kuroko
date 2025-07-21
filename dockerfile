# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

# Variables de entorno necesarias para el build
ENV NODE_ENV=production

# Instalar deps y construir Next.js en modo standalone
RUN npm ci && npm run build

# Etapa 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copiar artefactos de build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]
