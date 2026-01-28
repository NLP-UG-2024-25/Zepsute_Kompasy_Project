# Docker/Podman Commands for SoundCalendar

All containers support hot-reload: edit your code, then refresh the browser to see changes.

---

## Prerequisites: Install Podman or Docker

### Windows

**Option A: Podman (Recommended)**
```powershell
# Install via winget
winget install RedHat.Podman

# Or download installer from: https://github.com/containers/podman/releases

# After installation, initialize and start the Podman machine
podman machine init
podman machine start

# Verify installation
podman --version
```

**Option B: Docker Desktop**
```powershell
# Install via winget
winget install Docker.DockerDesktop

# Or download from: https://www.docker.com/products/docker-desktop/

# Start Docker Desktop from Start Menu, then verify
docker --version
```

### macOS

**Option A: Podman (Recommended)**
```bash
# Install via Homebrew
brew install podman

# Initialize and start the Podman machine
podman machine init
podman machine start

# Verify installation
podman --version

# Optional: Install podman-compose for docker-compose compatibility
brew install podman-compose
```

**Option B: Docker Desktop**
```bash
# Install via Homebrew
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop/

# Start Docker Desktop from Applications, then verify
docker --version
```

### Linux (Ubuntu/Debian)

**Option A: Podman**
```bash
# Ubuntu 20.10+ / Debian 11+
sudo apt update
sudo apt install -y podman

# For older versions, add the repository first:
# sudo apt install -y software-properties-common
# sudo add-apt-repository -y ppa:projectatomic/ppa
# sudo apt update
# sudo apt install -y podman

# Verify installation
podman --version

# Optional: Install podman-compose
sudo apt install -y podman-compose
# Or via pip: pip install podman-compose
```

**Option B: Docker**
```bash
# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose

# Add your user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
```

### Linux (Fedora/RHEL/CentOS)

**Podman (pre-installed on Fedora)**
```bash
# Fedora (usually pre-installed)
sudo dnf install -y podman podman-compose

# RHEL/CentOS 8+
sudo dnf install -y podman podman-compose

# Verify
podman --version
```

---

## Starting Podman/Docker

### Podman (macOS/Windows)
```bash
# Check machine status
podman machine list

# Start the machine (required before running containers)
podman machine start

# Stop the machine when done
podman machine stop
```

### Docker (Linux)
```bash
# Start Docker service
sudo systemctl start docker

# Check status
sudo systemctl status docker

# Stop Docker service
sudo systemctl stop docker
```

### Docker Desktop (macOS/Windows)
- Start Docker Desktop application from Start Menu (Windows) or Applications (macOS)
- Wait for the whale icon in system tray to show "Docker Desktop is running"

---

## Option 1: Desktop Browser Container (port 8080)

### Build
```bash
podman build -f Dockerfile.desktop -t soundcalendar-desktop .
```

### Run

**Linux / Mac:**
```bash
podman run -d --name soundcalendar-desktop -p 8080:80 -v "$(pwd)":/usr/share/nginx/html:ro soundcalendar-desktop
```

**Windows PowerShell:**
```powershell
podman run -d --name soundcalendar-desktop -p 8080:80 -v "${PWD}:/usr/share/nginx/html:ro" soundcalendar-desktop
```

**Windows CMD:**
```cmd
podman run -d --name soundcalendar-desktop -p 8080:80 -v "%cd%":/usr/share/nginx/html:ro soundcalendar-desktop
```

**Access:** http://localhost:8080

---

## Option 2: Mobile Preview Frame (port 3000) - RECOMMENDED

Shows your app inside a phone-shaped frame. Switch between iPhone, Pixel, Galaxy, iPad views.

### Build
```bash
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .
```

### Run

**Linux / Mac:**
```bash
podman run -d --name soundcalendar-mobile-preview -p 3000:80 \
  -v "$(pwd)":/usr/share/nginx/app:ro \
  -v "$(pwd)/mobile-preview":/usr/share/nginx/preview:ro \
  soundcalendar-mobile-preview
```

**Windows PowerShell:**
```powershell
podman run -d --name soundcalendar-mobile-preview -p 3000:80 `
  -v "${PWD}:/usr/share/nginx/app:ro" `
  -v "${PWD}/mobile-preview:/usr/share/nginx/preview:ro" `
  soundcalendar-mobile-preview
```

**Windows CMD:**
```cmd
podman run -d --name soundcalendar-mobile-preview -p 3000:80 -v "%cd%":/usr/share/nginx/app:ro -v "%cd%/mobile-preview":/usr/share/nginx/preview:ro soundcalendar-mobile-preview
```

**Access:** http://localhost:3000

Features:
- Switch between iPhone SE, iPhone 14, iPhone 14 Pro Max, Pixel 7, Galaxy S23, iPad Mini
- Shows actual device dimensions
- Click "Refresh Preview" after code changes

---

## Option 3: Real Android Emulator (port 6080) - Full Emulation

Runs actual Android 14 in a container with Chrome browser. Access via web browser (noVNC).

**Requirements:**
- 4GB+ RAM for Docker/Podman
- First startup takes several minutes (downloading Android image ~3GB)

### Run with Docker Compose

**Linux / Mac / Windows:**
```bash
podman-compose -f docker-compose.mobile-emulator.yml up -d
```

### Access
1. Open http://localhost:6080 in your browser
2. Wait for Android to boot (1-3 minutes first time)
3. Open Chrome on the emulated Android
4. Navigate to `http://web` (the web server in the compose network)

### Stop
```bash
podman-compose -f docker-compose.mobile-emulator.yml down
```

---

## Container Management

### List containers
```bash
# List running containers
podman ps

# List all containers (including stopped)
podman ps -a
```

### Stop containers
```bash
# Stop one container
podman stop soundcalendar-mobile-preview

# Stop multiple containers
podman stop soundcalendar-desktop soundcalendar-mobile-preview

# Stop all running containers
podman stop -a
```

### Remove containers
```bash
# Remove stopped container
podman rm soundcalendar-mobile-preview

# Remove multiple containers
podman rm soundcalendar-desktop soundcalendar-mobile-preview

# Force remove (stop + remove in one command)
podman rm -f soundcalendar-mobile-preview

# Force remove all project containers
podman rm -f soundcalendar-desktop soundcalendar-mobile-preview
```

### Remove old container before starting new one
If you get error: `container name already in use`, run:

**Linux / Mac:**
```bash
podman rm -f soundcalendar-mobile-preview
```

**Windows PowerShell / CMD:**
```powershell
podman rm -f soundcalendar-mobile-preview
```

### Clean up everything (containers + images)
```bash
# Remove all stopped containers
podman container prune

# Remove all unused images
podman image prune

# Remove everything (containers, images, volumes, networks)
podman system prune -a
```

### View logs
```bash
# View logs
podman logs soundcalendar-mobile-preview

# Follow logs in real-time
podman logs -f soundcalendar-mobile-preview

# Show last 50 lines
podman logs --tail 50 soundcalendar-mobile-preview
```

### Restart container
```bash
podman restart soundcalendar-mobile-preview
```

### Enter container shell (for debugging)
```bash
podman exec -it soundcalendar-mobile-preview sh
```

---

## Rebuild After Dockerfile Changes

If you modify Dockerfile or nginx config, rebuild:

**Linux / Mac:**
```bash
podman rm -f soundcalendar-mobile-preview
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .
podman run -d --name soundcalendar-mobile-preview -p 3000:80 \
  -v "$(pwd)":/usr/share/nginx/app:ro \
  -v "$(pwd)/mobile-preview":/usr/share/nginx/preview:ro \
  soundcalendar-mobile-preview
```

**Windows PowerShell:**
```powershell
podman rm -f soundcalendar-mobile-preview
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .
podman run -d --name soundcalendar-mobile-preview -p 3000:80 `
  -v "${PWD}:/usr/share/nginx/app:ro" `
  -v "${PWD}/mobile-preview:/usr/share/nginx/preview:ro" `
  soundcalendar-mobile-preview
```

---

## Quick Start - Desktop + Mobile Preview

### Linux / Mac
```bash
# Build both
podman build -f Dockerfile.desktop -t soundcalendar-desktop .
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .

# Remove old containers (if exist)
podman rm -f soundcalendar-desktop soundcalendar-mobile-preview 2>/dev/null

# Run both
podman run -d --name soundcalendar-desktop -p 8080:80 \
  -v "$(pwd)":/usr/share/nginx/html:ro soundcalendar-desktop

podman run -d --name soundcalendar-mobile-preview -p 3000:80 \
  -v "$(pwd)":/usr/share/nginx/app:ro \
  -v "$(pwd)/mobile-preview":/usr/share/nginx/preview:ro \
  soundcalendar-mobile-preview
```

### Windows PowerShell
```powershell
# Build both
podman build -f Dockerfile.desktop -t soundcalendar-desktop .
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .

# Remove old containers (if exist)
podman rm -f soundcalendar-desktop soundcalendar-mobile-preview 2>$null

# Run both
podman run -d --name soundcalendar-desktop -p 8080:80 `
  -v "${PWD}:/usr/share/nginx/html:ro" soundcalendar-desktop

podman run -d --name soundcalendar-mobile-preview -p 3000:80 `
  -v "${PWD}:/usr/share/nginx/app:ro" `
  -v "${PWD}/mobile-preview:/usr/share/nginx/preview:ro" `
  soundcalendar-mobile-preview
```

### Windows CMD
```cmd
REM Build both
podman build -f Dockerfile.desktop -t soundcalendar-desktop .
podman build -f Dockerfile.mobile-preview -t soundcalendar-mobile-preview .

REM Remove old containers (if exist)
podman rm -f soundcalendar-desktop soundcalendar-mobile-preview

REM Run both
podman run -d --name soundcalendar-desktop -p 8080:80 -v "%cd%":/usr/share/nginx/html:ro soundcalendar-desktop
podman run -d --name soundcalendar-mobile-preview -p 3000:80 -v "%cd%":/usr/share/nginx/app:ro -v "%cd%/mobile-preview":/usr/share/nginx/preview:ro soundcalendar-mobile-preview
```

---

## Access URLs

| Container | URL | Description |
|-----------|-----|-------------|
| Desktop | http://localhost:8080 | Standard browser view |
| Mobile Preview | http://localhost:3000 | Phone frame with device selector |
| Android Emulator | http://localhost:6080 | Full Android OS (noVNC) |

---

## Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile.desktop` | nginx container for desktop browser |
| `Dockerfile.mobile-preview` | nginx container with phone frame UI |
| `Dockerfile.mobile` | Simple Node.js server (legacy) |
| `nginx-mobile-preview.conf` | nginx config for mobile preview |
| `mobile-preview/index.html` | Phone frame UI with device selector |
| `docker-compose.mobile-emulator.yml` | Android emulator setup |
