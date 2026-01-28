# YouTube Cookies para yt-dlp

Este directorio contiene las cookies de YouTube necesarias para evitar el bloqueo de bot.

## Por que necesitas cookies?

YouTube bloquea las descargas automatizadas detectandolas como bots. Las cookies de una sesion real del navegador permiten que yt-dlp se identifique como un usuario humano legitimo.

## Como exportar cookies

### Opcion 1: Extension de navegador (Recomendado)

1. Instala la extension **"Get cookies.txt LOCALLY"** en Chrome/Firefox
   - Chrome: https://chrome.google.com/webstore/detail/get-cookiestxt-locally/
   - Firefox: https://addons.mozilla.org/firefox/addon/cookies-txt/

2. Ve a https://www.youtube.com e inicia sesion con tu cuenta

3. Haz clic en la extension y selecciona "Export" o "Current Site"

4. Guarda el archivo como `cookies.txt` en este directorio

### Opcion 2: Usando yt-dlp directamente

```bash
# Exportar desde Chrome
yt-dlp --cookies-from-browser chrome --cookies cookies.txt --skip-download "https://www.youtube.com"

# Exportar desde Firefox
yt-dlp --cookies-from-browser firefox --cookies cookies.txt --skip-download "https://www.youtube.com"

# Exportar desde Edge
yt-dlp --cookies-from-browser edge --cookies cookies.txt --skip-download "https://www.youtube.com"
```

## Estructura del archivo

El archivo `cookies.txt` debe estar en formato Netscape:

```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1234567890	COOKIE_NAME	cookie_value
```

## Notas importantes

- Las cookies expiran, si empiezas a ver errores 403 de nuevo, exporta cookies frescas
- Nunca compartas tu archivo cookies.txt (contiene tu sesion)
- Agrega cookies.txt a .gitignore (ya esta agregado)

## Solucion de problemas

Si sigues viendo errores despues de agregar cookies:

1. Asegrate de estar logueado en YouTube antes de exportar
2. Verifica que el archivo se llame exactamente `cookies.txt`
3. Reinicia los contenedores: `docker-compose -f docker-compose.dev.yml restart backend`
