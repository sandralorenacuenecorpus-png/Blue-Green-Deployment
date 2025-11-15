#!/bin/bash

# Script para cambiar entre entornos Blue y Green
# Uso: ./switch.sh [blue|green]

set -e

TARGET_ENV=$1

if [ -z "$TARGET_ENV" ]; then
    echo "❌ Error: Debes especificar el entorno (blue o green)"
    echo "Uso: ./switch.sh [blue|green]"
    exit 1
fi

if [ "$TARGET_ENV" != "blue" ] && [ "$TARGET_ENV" != "green" ]; then
    echo "❌ Error: Entorno inválido. Usa 'blue' o 'green'"
    exit 1
fi

NGINX_CONF="./nginx/nginx.conf"

# Determinar el backend objetivo
if [ "$TARGET_ENV" = "blue" ]; then
    NEW_BACKEND="blue_backend"
    OLD_BACKEND="green_backend"
else
    NEW_BACKEND="green_backend"
    OLD_BACKEND="blue_backend"
fi

echo "🔄 Cambiando tráfico al entorno $TARGET_ENV..."

# Modificar el archivo en el host
sed -i.bak "s|proxy_pass http://$OLD_BACKEND;|proxy_pass http://$NEW_BACKEND;|g" $NGINX_CONF
sed -i.bak "s|# ACTIVE ENVIRONMENT: .*|# ACTIVE ENVIRONMENT: $TARGET_ENV|g" $NGINX_CONF

# Recargar Nginx
echo "🔄 Recargando configuración de Nginx..."
docker exec load_balancer nginx -t
docker exec load_balancer nginx -s reload

echo "✅ Tráfico redirigido exitosamente al entorno $TARGET_ENV"
echo "🌐 Verifica en: http://localhost:8080"