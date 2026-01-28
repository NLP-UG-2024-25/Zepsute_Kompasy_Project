# Docker/Podman Commands for SoundCalendar

All containers support hot-reload: edit your code, then refresh the browser to see changes.

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

### Stop containers
```bash
podman stop soundcalendar-desktop soundcalendar-mobile-preview
```

### Remove containers
```bash
podman rm soundcalendar-desktop soundcalendar-mobile-preview
```

### Force remove (stop + remove)
```bash
podman rm -f soundcalendar-desktop soundcalendar-mobile-preview
```

### View logs
```bash
podman logs soundcalendar-desktop
podman logs soundcalendar-mobile-preview
```

### Restart container
```bash
podman restart soundcalendar-mobile-preview
```

### List running containers
```bash
podman ps
```

### List all containers (including stopped)
```bash
podman ps -a
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
