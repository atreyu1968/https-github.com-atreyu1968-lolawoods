# 📖 Portal Literario Lola Woods - Servidor de Producción

Un portal literario sofisticado para la autora de romance histórico **Lola Woods**. La aplicación cuenta con una arquitectura full-stack moderna compuesta por un frontend interactivo en **React** (estilizado con Tailwind CSS) y un backend en **Express** con almacenamiento estructurado y permanente a través de una base de datos local **SQLite**.

---

## 🚀 Instalación Desatendida en Servidores Ubuntu (Bare-Metal)

Si tienes un servidor Ubuntu **totalmente nuevo, sin actualizar y vacío** (sin `git`, `curl` ni herramientas básicas de desarrollo), puedes desplegar la aplicación completa en menos de 5 minutos utilizando el script de autoinstalación incluido.

### ⚙️ Método 1: Ejecución con una sola línea (Súper Rápido)

Conéctate a tu servidor Ubuntu por SSH y ejecuta el siguiente comando compuesto. Este comando actualizará tu sistema, instalará `curl` y descargará el script de instalación automática directamente desde tu repositorio para ejecutarlo de inmediato:

```bash
sudo apt-get update && sudo apt-get install -y curl && curl -fsSL https://raw.githubusercontent.com/atreyu1968/https-github.com-atreyu1968-lolawoods/main/autoinstall.sh | sudo bash
```

---

### 📂 Método 2: Clonado manual paso a paso

Si prefieres realizar el proceso o revisar los archivos antes de la ejecución, puedes hacerlo manualmente siguiendo estos sencillos pasos:

#### **Paso 1: Actualizar el servidor de paquetes e instalar Git/Curl**
Dado que el servidor está limpio, instalaremos los recursos necesarios para descargar los repositorios:
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git
```

#### **Paso 2: Clonar el repositorio oficial**
Descarga la rama principal de la aplicación en el directorio deseado (por ejemplo, en `/var/www/lolawoods` para un entorno seguro):
```bash
sudo git clone https://github.com/atreyu1968/https-github.com-atreyu1968-lolawoods /var/www/lolawoods
```

#### **Paso 3: Ejecutar el instalador desatendido incorporado**
Accede al directorio del código y dale permisos de ejecución al script `autoinstall.sh` para levantar todo el ecosistema (instalará Node.js, compilará la SPA, programará systemd y abrirá el puerto de producción):
```bash
cd /var/www/lolawoods
sudo chmod +x autoinstall.sh
sudo ./autoinstall.sh
```

---

## 🛠️ ¿Qué hace el script `autoinstall.sh` de forma automatizada?

El script se encarga de realizar todo el trabajo pesado de administración de sistemas por ti:
1. **Actualiza la lista de APT** y los paquetes obsoletos del sistema operativo.
2. Instala herramientas de compilación como **`build-essential`**, **`make`**, **`g++`** y **`sqlite3`** (fundamentales para la construcción de módulos nativos de base de datos como `better-sqlite3`).
3. Instala de forma segura el entorno de ejecución oficial **Node.js LTS (v20)**.
4. Descarga las dependencias del proyecto (`npm install`) y compila de forma optimizada el frontend (`npm run build`).
5. Configura los **permisos del propietario** y de lectura/escritura en la base de datos local SQLite para evitar fugas o problemas de acceso.
6. Registra y levanta el servicio del sistema mediante **`systemd`** configurado para asegurar alta disponibilidad (reinicio automático en caso de fallos del servidor).

---

## 🧭 Comandos Útiles de Operación y Administración

Una vez ejecutada la instalación, la aplicación se ejecutará continuamente en segundo plano y escuchará tráfico directamente en el puerto **`3000`**.

### 📊 Estado y control de la Web
Usa estos comandos de terminal estándar de Ubuntu para controlar el servidor web en cualquier momento:

* **Inspeccionar el estado general del servicio:**
  ```bash
  sudo systemctl status lolawoods
  ```
* **Reiniciar el servidor literario (aplicar cambios en código):**
  ```bash
  sudo systemctl restart lolawoods
  ```
* **Detener la entrega de la web:**
  ```bash
  sudo systemctl stop lolawoods
  ```
* **Arrancar de nuevo el servicio:**
  ```bash
  sudo systemctl start lolawoods
  ```

### 📝 Lectura de registros/logs en vivo
Si deseas monitorizar visitas, intentos de autenticación en el panel de control o posibles errores de red del servidor Express en tiempo real, usa:
```bash
sudo journalctl -u lolawoods -f
```

---

## 🔒 Control de la Autenticación del Administrador

La web viene precargada con un panel de control avanzado desde donde Lola Woods puede cambiar portadas, agregar fechas literarias y gestionar los correos de boletín informativos de las lectoras.

* **Dirección del Panel:** Modifica el catálogo directamente haciendo clic en **Panel Admin** en la barra superior de tu navegador web.
* **Código de Acceso Inicial:** `1234` o el configurado inicialmente en la sección de control del servidor. El script mantendrá la base de datos persistente en el archivo local de la base de datos `lola_woods.db`.

---

## 📂 Directorio de Archivos en el Servidor
* **Ruta de instalación:** `/var/www/lolawoods`
* **Base de datos física (SQLite):** `/var/www/lolawoods/lola_woods.db`
* **Assets estáticos de la web compilada:** `/var/www/lolawoods/dist`
* **Archivo de servicio del sistema:** `/etc/systemd/system/lolawoods.service`

Ahora tu portal literario está configurado de forma óptima para entregar una velocidad y robustez ejemplar con SQLite nativo.
