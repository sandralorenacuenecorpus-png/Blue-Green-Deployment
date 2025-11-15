# switch.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('blue','green')]
    [string]$TargetEnv
)

# Obtener la ruta del script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$nginxConf = Join-Path $scriptPath "nginx.conf"

if (-not (Test-Path $nginxConf)) {
    Write-Host "❌ Error: No se encuentra $nginxConf" -ForegroundColor Red
    exit 1
}

if ($TargetEnv -eq "blue") {
    $newBackend = "blue_backend"
    $oldBackend = "green_backend"
} else {
    $newBackend = "green_backend"
    $oldBackend = "blue_backend"
}

Write-Host "🔄 Cambiando tráfico al entorno $TargetEnv..." -ForegroundColor Cyan

# Leer, modificar y guardar
$content = Get-Content $nginxConf -Raw
$content = $content -replace "proxy_pass http://$oldBackend;", "proxy_pass http://$newBackend;"
$content = $content -replace "# ACTIVE ENVIRONMENT: .*", "# ACTIVE ENVIRONMENT: $TargetEnv"
$content | Set-Content $nginxConf -NoNewline

# Recargar Nginx
Write-Host "🔄 Recargando configuración de Nginx..." -ForegroundColor Cyan
docker exec load_balancer nginx -t
if ($LASTEXITCODE -eq 0) {
    docker exec load_balancer nginx -s reload
    Write-Host "✅ Tráfico redirigido exitosamente al entorno $TargetEnv" -ForegroundColor Green
    Write-Host "🌐 Verifica en: http://localhost:8080" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error en la configuración de Nginx" -ForegroundColor Red
}