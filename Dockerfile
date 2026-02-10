# Usa l'immagine base di Node
FROM node:20-alpine AS node

# Installazione dipendenze di sistema
RUN apk add --no-cache jemalloc python3 py3-pip uv
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

# Setup UV per MCP
COPY --from=ghcr.io/astral-sh/uv:0.9.5-python3.12-alpine /usr/local/bin/uv /usr/local/bin/uvx /bin/

ARG NODE_MAX_OLD_SPACE_SIZE=6144
RUN mkdir -p /app && chown node:node /app
WORKDIR /app

USER node

# Copia i file per l'installazione delle dipendenze
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node client/package.json ./client/package.json
COPY --chown=node:node packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=node:node packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=node:node packages/api/package.json ./packages/api/package.json

# Installazione dipendenze
RUN npm ci --no-audit

# --- QUI IL PASSAGGIO CHIAVE ---
# Copiamo tutto il resto del codice sorgente
COPY --chown=node:node . .

# SOVRASCRIVIAMO il file originale con il tuo custom PRIMA della build

COPY --chown=node:node ./client/src/custom_components/Nav/Nav.tsx /app/client/src/components/Nav/Nav.tsx

# Ora lanciamo la build: Vite vedrà il tuo file al posto di quello standard
RUN NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE}" npm run frontend; \
    npm prune --production; \
    npm cache clean --force

EXPOSE 3080
ENV HOST=0.0.0.0
CMD ["npm", "run", "backend"]