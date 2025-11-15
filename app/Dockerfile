FROM node:18-alpine

# Argumentos de construcción
ARG VERSION=1.0
ARG COLOR=blue

# Variables de entorno
ENV APP_VERSION=${VERSION}
ENV APP_COLOR=${COLOR}
ENV NODE_ENV=production

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar dependencias y curl para healthcheck
RUN npm ci --only=production && \
    apk add --no-cache curl

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Usuario no-root para seguridad
USER node

# Comando de inicio
CMD ["node", "server.js"]