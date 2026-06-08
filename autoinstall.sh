#!/usr/bin/env bash

# ==============================================================================
# SCRIPT DE AUTOINSTALACIÓN DESATENDIDA PARA LA WEB DE LOLA WOODS
# Diseñado para servidores Ubuntu (desde una instalación nueva/bare-metal)
# ==============================================================================

# Detener el script si ocurre algún error
set -eo pipefail

# Asegurar que el script se ejecuta como root (sudo)
if [ "$EUID" -ne 0 ]; then
  echo "[-] Este script necesita ser ejecutado con privilegios de administrador (root)."
  echo "[*] Por favor, ejecute: sudo bash autoinstall.sh"
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
echo -e "${GREEN}${BOLD}      Instalador Oficial - Lola Woods Portal Literario (SQLite DB)      ${NC}"
echo -e "${BLUE}${BOLD}========================================================================${NC}"
echo -e "[*] Iniciando instalación desatendida en este servidor Ubuntu..."
echo -e "[*] Actualizando repositorios iniciales de paquetes..."

# 1. Actualizar el sistema e instalar dependencias básicas
echo -e "\n${YELLOW}[1/6] Actualizando el sistema e instalando herramientas básicas...${NC}"
apt-get update -y
apt-get upgrade -y

echo -e "[*] Instalando herramientas esenciales (curl, git, build-essential, python3, etc.)..."
apt-get install -y curl git build-essential sqlite3 libsqlite3-dev

# 2. Instalar Node.js v20 (LTS) desde NodeSource
echo -e "\n${YELLOW}[2/6] Instalando Node.js v20 (LTS) de forma automática...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo -e "[*] Versión de Node instalada: $(node -v)"
echo -e "[*] Versión de NPM instalada: $(npm -v)"

# 3. Configurar directorio de destino y clonar el repositorio
INSTALL_DIR="/var/www/lolawoods"
REPO_URL="https://github.com/atreyu1968/https-github.com-atreyu1968-lolawoods"

echo -e "\n${YELLOW}[3/6] Preparando el directorio e instalando el código fuente...${NC}"
# Si existe una instalación previa, la respaldamos de forma limpia
if [ -d "$INSTALL_DIR" ]; then
  echo -e "[!] El directorio $INSTALL_DIR ya existe. Creando respaldo antes de continuar..."
  mv "$INSTALL_DIR" "${INSTALL_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

echo -e "[*] Clonando el repositorio desde ${REPO_URL}..."
git clone "$REPO_URL" "$INSTALL_DIR"

# 4. Instalar paquetes de npm y compilar la aplicación para producción
echo -e "\n${YELLOW}[4/6] Instalando dependencias de Node y compilando la web...${NC}"
cd "$INSTALL_DIR"

# Limpieza inicial de caché / node_modules si es que existieran por alguna razón
rm -rf node_modules dist

echo -e "[*] Ejecutando: npm install --no-audit --no-fund"
npm install --no-audit --no-fund

echo -e "[*] Compilando assets del frontend y bundling del backend Express-SQLite..."
npm run build

# Crear base de datos SQLite en blanco con tablas básicas si no se ha inicializado
# El propio backend de la aplicación se encarga de crear el archivo lola_woods.db y sembrar
# los datos iniciales al arrancar la primera vez.

# 5. Configurar permisos seguros
echo -e "\n${YELLOW}[5/6] Asegurando permisos del sistema para el servidor web (www-data)...${NC}"
# www-data es el usuario clásico de aplicaciones web en Ubuntu
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
# Asegurar permisos de escritura adicionales para SQLite en el directorio donde reside la DB
chmod 775 "$INSTALL_DIR"

# 6. Crear servicio de Systemd para arrancar la aplicación automáticamente con el sistema
echo -e "\n${YELLOW}[6/6] Registrando aplicación como servicio del sistema (systemd)...${NC}"
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

echo -e "[*] Habilitando servicio lolawoods en el inicio del sistema..."
systemctl enable lolawoods

echo -e "[*] Iniciando el servicio lolawoods..."
systemctl restart lolawoods

# Detectar la dirección IP pública del servidor de forma amigable
IP_PUBLICA=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "IP_DEL_SERVIDOR")

echo -e "\n${GREEN}${BOLD}========================================================================${NC}"
echo -e "${GREEN}${BOLD}        ¡INSTALACIÓN COMPLETADA CON ÉXITO!                              ${NC}"
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo -e "La web e interfaz de administración de Lola Woods ya están listas."
echo -e ""
echo -e "  --> Acceso a la web:   ${BOLD}http://${IP_PUBLICA}${NC}"
echo -e "  --> Directorio físico: ${BOLD}${INSTALL_DIR}${NC}"
echo -e "  --> Servicio systemd:  ${BOLD}lolawoods.service${NC}"
echo -e ""
echo -e "${YELLOW}Comandos útiles de gestión:${NC}"
echo -e "  - Ver el estado de la web:     ${BOLD}sudo systemctl status lolawoods${NC}"
echo -e "  - Detener la aplicación:       ${BOLD}sudo systemctl stop lolawoods${NC}"
echo -e "  - Iniciar la aplicación:       ${BOLD}sudo systemctl start lolawoods${NC}"
echo -e "  - Reiniciar la aplicación:     ${BOLD}sudo systemctl restart lolawoods${NC}"
echo -e "  - Ver registros/logs en vivo:  ${BOLD}sudo journalctl -u lolawoods -f${NC}"
echo -e ""
echo -e "Disfruta de la web de Lola Woods con base de datos SQLite persistente."
echo -e "${BLUE}========================================================================${NC}"
