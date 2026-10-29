@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Instala Node.js 24 LTS y vuelve a abrir este archivo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias del proyecto...
  call npm install
  if errorlevel 1 (
    echo No se pudo completar la instalacion. Revisa tu conexion y la salida anterior.
    pause
    exit /b 1
  )
)
echo Abre en tu navegador la direccion que mostrara Vite.
call npm run dev
pause
