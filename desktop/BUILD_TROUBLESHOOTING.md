# Guía de Solución de Problemas - Build Windows

Si encuentras errores de archivos bloqueados durante la compilación, sigue estos pasos en orden.

## ⚠️ Error Común

```
Error: EBUSY: resource busy or locked, unlink '...\app.asar'
```

**Causa raíz:** VSCode mantiene los archivos `.asar` abiertos para indexación y búsqueda.

---

## ✅ Soluciones Profesionales

### 🥇 Solución 1: Ejecutar como Administrador (RECOMENDADO)

Usa el script que automáticamente solicita permisos de administrador:

```bash
# Doble clic en el archivo o ejecutar en terminal:
./dist-admin.bat
```

Este script:
- Solicita automáticamente permisos de administrador
- Ejecuta limpieza con handle.exe
- Compila frontend, backend y Electron
- Genera el instalador .exe

### 🥈 Solución 2: Cerrar VSCode antes de compilar

```bash
# 1. Cierra completamente VSCode
# 2. Abre una terminal nueva (CMD o PowerShell)
# 3. Navega al proyecto y ejecuta:
cd desktop
npm run dist:windows
```

### 🥉 Solución 3: Excluir carpeta release de VSCode

Ya configurado en [`.vscode/settings.json`](.vscode/settings.json):

```json
{
  "files.exclude": {
    "**/release": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/release": true,
    "**/dist": true
  }
}
```

**Para aplicar los cambios:**
1. Recarga VSCode: `Ctrl + Shift + P` → "Developer: Reload Window"
2. Ejecuta: `npm run dist:windows`

---

## 🔧 Scripts Disponibles

### `dist-admin.bat` ⭐ (RECOMENDADO)
Solicita admin automáticamente y ejecuta toda la compilación:
```bash
./dist-admin.bat
```

### `npm run clean`
Limpia la carpeta release usando handle.exe:
```bash
npm run clean
```

### `force-clean.bat`
Limpieza forzada manual (ejecutar como Admin):
```bash
./force-clean.bat
```

### `npm run dist:windows`
Compilación estándar (ejecuta `prebuild` automáticamente):
```bash
npm run dist:windows
```

---

## 📋 Flujo de Compilación Recomendado

### Opción A: Con VSCode abierto (Requiere Admin)

```bash
# 1. Abrir terminal en VSCode
# 2. Ejecutar (solicitará admin):
./dist-admin.bat
```

### Opción B: Sin VSCode (No requiere Admin)

```bash
# 1. Cerrar VSCode completamente
# 2. Abrir CMD/PowerShell
# 3. Ejecutar:
cd desktop
npm run dist:windows
```

### Opción C: Limpieza manual completa

```bash
# 1. Cerrar VSCode
# 2. Abrir PowerShell como Administrador
# 3. Ejecutar:
cd C:\Users\becer\OneDrive\Escritorio\proyectos\media-downloader\desktop
Remove-Item -Path release -Recurse -Force
npm run dist:windows
```

---

## 🔍 ¿Por qué ocurre este error?

El error `EBUSY: resource busy or locked` ocurre porque:

1. **VSCode abre los archivos `.asar`** para indexación y búsqueda
2. **Windows bloquea los archivos** mientras están en uso por un proceso
3. **electron-builder no puede eliminar** la carpeta `release/` para recrearla

**Herramientas de diagnóstico:**
- `handle64.exe` - Muestra qué proceso tiene un archivo abierto
- Ya incluido en el proyecto, se descarga automáticamente

---

## 💡 Consejos para Evitar Errores

1. ✅ **Usa `.vscode/settings.json`** - Excluye `release/` y `dist/` de VSCode
2. ✅ **Ejecuta como Admin** - Usa `dist-admin.bat` para compilaciones
3. ✅ **Cierra VSCode** - Antes de compilar si no usas el script de admin
4. ✅ **No abras release/** - Nunca abras la carpeta `release/` en el explorador
5. ✅ **Usa los scripts npm** - No ejecutes electron-builder directamente

---

## 🚀 Compilación Exitosa

Después de una compilación exitosa:

```
desktop/
├── release/                              # ← Directorio de salida
│   ├── win-unpacked/                    # App portable (sin instalar)
│   │   ├── Media Downloader.exe          # Ejecutable principal
│   │   └── resources/
│   │       └── app.asar                  # Código de la app
│   └── Media Downloader Setup 1.0.0.exe  # Instalador
│
├── dist/                                 # Código compilado de Electron
│   ├── main.js
│   └── preload.js
│
├── handle64.exe                          # Herramienta de diagnóstico
└── scripts/
    └── clean-build.js                    # Script de limpieza
```

**Para probar la app:**
```bash
# App portable (sin instalar)
.\release\win-unpacked\Media Downloader.exe

# O instalar usando el instalador
.\release\Media Downloader Setup 1.0.0.exe
```

---

## 🆘 Si Nada Funciona

### Opción 1: Compilar en otra máquina
- Usa GitHub Actions o CI/CD
- Compila en una máquina virtual limpia

### Opción 2: Reiniciar en Modo Seguro
1. Reinicia Windows en Modo Seguro
2. Ejecuta `npm run dist:windows`
3. Reinicia normalmente

### Opción 3: Excluir del antivirus
Windows Defender puede bloquear archivos:

1. Abre **Windows Security**
2. **Virus & threat protection** → **Manage settings**
3. **Exclusions** → **Add exclusion**
4. Agrega: `C:\Users\becer\OneDrive\Escritorio\proyectos\media-downloader\desktop`

---

## 📞 Referencias

- [electron-builder Documentation](https://www.electron.build/)
- [Handle.exe - Sysinternals](https://learn.microsoft.com/en-us/sysinternals/downloads/handle)
- [VSCode Settings](https://code.visualstudio.com/docs/getstarted/settings)
