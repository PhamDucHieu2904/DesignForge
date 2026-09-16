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
set "DESIGNFORGE_NODE=%ProgramFiles%\nodejs\node.exe"
if not exist "%DESIGNFORGE_NODE%" set "DESIGNFORGE_NODE=node.exe"
start "DesignForge preview server" /min "%DESIGNFORGE_NODE%" "%~dp0scripts\dev.mjs"

rem Doi build va local server san sang truoc khi mo trinh duyet.
set "DESIGNFORGE_READY="
for /l %%I in (1,1,30) do (
  powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4173/' -TimeoutSec 1; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }; exit 1" >nul 2>&1
  if not errorlevel 1 (
    set "DESIGNFORGE_READY=1"
    goto preview_ready
  )
  powershell -NoProfile -Command "Start-Sleep -Seconds 1" >nul 2>&1
)

echo [DesignForge] Server khong khoi dong trong 30 giay.
echo Hay kiem tra Node.js va npm neu server khong khoi dong.
pause
exit /b 1

:preview_ready
start "" "http://127.0.0.1:4173/"

echo [DesignForge] Da mo http://127.0.0.1:4173/
echo Cua so server chay o nen. Dong cua so server de dung preview.
endlocal
