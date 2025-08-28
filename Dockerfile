# ---------- Build ----------
FROM node:20-alpine AS build

LABEL maintanier="Mateusz Dalke"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Compile and prune dev dependencies
RUN npm run build && npm prune --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node

# get only the production dependencies and the built files
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package*.json ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=2s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
