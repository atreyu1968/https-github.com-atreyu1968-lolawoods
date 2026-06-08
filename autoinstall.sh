#!/usr/bin/env bash

# ==============================================================================
# SCRIPT DE AUTOINSTALACIÓN Y ACTUALIZACIÓN DESATENDIDA PARA LA WEB DE LOLA WOODS
# Diseñado para servidores Ubuntu / Debian (libre de prompts interactivos)
# ==============================================================================

# Detener el script si ocurre algún error
set -eo pipefail

# Forzar modo no interactivo para evitar que apt-get pregunte al usuario
export DEBIAN_FRONTEND=noninteractive

# Asegurar que el script se ejecuta como root (sudo)
if [ "$EUID" -ne 0 ]; then
  echo "[-] Este script necesita ser ejecutado con privilegios de administrador (root)."
  echo "[*] Por favor, ejecuta: sudo -E bash autoinstall.sh"
  exit 1
fi

# Colores elegantes para salida en terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}========================================================================${NC}"
echo -e "${GREEN}${BOLD}      Instalador y Actualizador Desatendido - Lola Woods (SQLite)       ${NC}"
echo -e "${BLUE}${BOLD}========================================================================${NC}"
echo -e "[*] Iniciando proceso libre de prompts en este servidor..."

# 1. Actualizar el sistema e instalar dependencias básicas de manera desatendida
echo -e "\n${YELLOW}[1/6] Actualizando paquetes e instalando herramientas básicas...${NC}"
apt-get update -y
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade

echo -e "[*] Instalando herramientas esenciales (curl, git, build-essential, sqlite3, etc.)..."
apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" curl git build-essential sqlite3 libsqlite3-dev

# 2. Instalar Node.js v20 (LTS) de forma automática
echo -e "\n${YELLOW}[2/6] Verificando e Instalando Node.js v20 (LTS)...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1)" != "v20" ]; then
  echo -e "[*] Configurando repositorio de NodeSource para Node.js v20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nodejs
else
  echo -e "[*] Node.js v20 ya está instalado: $(node -v)"
fi

echo -e "[*] Versión de Node: $(node -v)"
echo -e "[*] Versión de NPM: $(npm -v)"

# 3. Configurar directorio de destino, clonar o actualizar el repositorio protegiendo la DB
INSTALL_DIR="/var/www/lolawoods"
REPO_URL="https://github.com/atreyu1968/https-github.com-atreyu1968-lolawoods"
BACKUP_DIR="/var/www/lolawoods_backups"

echo -e "\n${YELLOW}[3/6] Gestionando directorio de la app y código fuente...${NC}"
mkdir -p "$BACKUP_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo -e "${GREEN}[*] Detectada instalación previa con Git. Procediendo con actualización desatendida...${NC}"
  
  # Respaldo preventivo de la base de datos sqlite y sus archivos de journal si existen
  if [ -f "$INSTALL_DIR/lola_woods.db" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/lola_woods_${TIMESTAMP}.db"
    echo -e "[*] Guardando copia de respaldo de la base de datos en: $BACKUP_FILE"
    cp "$INSTALL_DIR/lola_woods.db" "$BACKUP_FILE"
    [ -f "$INSTALL_DIR/lola_woods.db-wal" ] && cp "$INSTALL_DIR/lola_woods.db-wal" "${BACKUP_FILE}-wal"
    [ -f "$INSTALL_DIR/lola_woods.db-shm" ] && cp "$INSTALL_DIR/lola_woods.db-shm" "${BACKUP_FILE}-shm"
  fi
  
  cd "$INSTALL_DIR"
  echo -e "[*] Limpiando cambios locales temporales no commiteados para evitar conflictos..."
  git reset --hard HEAD
  echo -e "[*] Descargando últimas actualizaciones..."
  git pull origin main || git pull
else
  if [ -d "$INSTALL_DIR" ]; then
    echo -e "[!] El directorio existe pero no es un repositorio Git. Creando respaldo completo..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
  fi
  echo -e "[*] Configurando nueva instalación mediante git clone..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# 4. Instalar paquetes de npm y compilar la aplicación para producción
echo -e "\n${YELLOW}[4/6] Instalando dependencias de Node y construyendo la aplicación...${NC}"
cd "$INSTALL_DIR"

# Limpiar compilación antigua
rm -rf dist

echo -e "[*] Ejecutando: npm install --no-audit --no-fund"
npm install --no-audit --no-fund

echo -e "[*] Compilando assets del frontend y bundling del backend..."
npm run build

# 5. Configurar permisos seguros
echo -e "\n${YELLOW}[5/6] Configurando permisos de usuario y de escritura para SQLite...${NC}"
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
# Permitir escritura al grupo en el directorio raíz para permitir creación del journal WAL de SQLite
chmod 775 "$INSTALL_DIR"
if [ -f "$INSTALL_DIR/lola_woods.db" ]; then
  chmod 664 "$INSTALL_DIR/lola_woods.db"* || true
  chown www-data:www-data "$INSTALL_DIR/lola_woods.db"* || true
fi

# 6. Crear o actualizar servicio de Systemd
echo -e "\n${YELLOW}[6/6] Verificando servicio del sistema (systemd)...${NC}"
SERVICE_FILE="/etc/systemd/system/lolawoods.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Portal Literario Lola Woods - Server Express y SQLite
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/server.cjs
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=lolawoods

[Install]
WantedBy=multi-user.target
EOF

echo -e "[*] Recargando el demonio de systemd..."
systemctl daemon-reload

echo -e "[*] Asegurando la activación y reinicio silencioso del servicio..."
systemctl enable lolawoods
systemctl restart lolawoods

# Intentar detectar la IP local/LAN del servidor para facilitar el acceso privado
IP_LAN=$(hostname -I | awk '{print $1}' || echo "IP_LOCAL")
IP_PUBLICA=$(curl -s --max-time 3 https://ifconfig.me || curl -s --max-time 3 https://api.ipify.org || echo "IP_PRIVADA")

echo -e "\n${GREEN}${BOLD}========================================================================${NC}"
echo -e "        ¡PROCESO COMPLETADO SATISFACTORIAMENTE!                         "
echo -e "========================================================================${NC}"
echo -e "La web e interfaz de Lola Woods se han instalado/actualizado correctamente."
echo -e ""
echo -e "  --> Acceso Local / LAN:  ${BOLD}http://${IP_LAN}:3000${NC} (o puerto configurado)"
if [ "$IP_PUBLICA" != "IP_PRIVADA" ] && [ "$IP_PUBLICA" != "" ]; then
  echo -e "  --> Acceso Público (si aplica): ${BOLD}http://${IP_PUBLICA}${NC}"
fi
echo -e "  --> Directorio físico:   ${BOLD}${INSTALL_DIR}${NC}"
echo -e "  --> Respaldos de DB:     ${BOLD}${BACKUP_DIR}/${NC}"
echo -e ""
echo -e "${YELLOW}Comandos útiles de administración:${NC}"
echo -e "  - Inspect status:   ${BOLD}sudo systemctl status lolawoods${NC}"
echo -e "  - Ver logs en vivo: ${BOLD}sudo journalctl -u lolawoods -f -n 50${NC}"
echo -e "  - Reiniciar app:    ${BOLD}sudo systemctl restart lolawoods${NC}"
echo -e "========================================================================="
