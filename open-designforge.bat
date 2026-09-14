@echo off
setlocal

rem DesignForge local preview launcher
cd /d "%~dp0"

if not exist "package.json" (
  echo [DesignForge] Khong tim thay package.json.
  echo Hay dat file nay trong thu muc goc cua DesignForge.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [DesignForge] Khong tim thay npm trong PATH.
  echo Hay cai Node.js va mo lai file nay.
  pause
  exit /b 1
)

echo [DesignForge] Dang khoi dong preview server...
start "DesignForge preview server" /min cmd /c "npm run dev"

rem Cho esbuild va local server khoi dong truoc khi mo trinh duyet.
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:4173/"

echo [DesignForge] Da mo http://127.0.0.1:4173/
echo Cua so server chay o nen. Dong cua so server de dung preview.
endlocal
