@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0.."
set "PORT=8765"
if defined AMVOICE_PORT set "PORT=%AMVOICE_PORT%"
set "URL=http://127.0.0.1:%PORT%/hronometr/"

echo Каталог: %CD%
git branch --show-current 2>nul && echo.
echo Откроется: %URL%
echo Главная:   http://127.0.0.1:%PORT%/
echo Закрыть:   закройте это окно или Ctrl+C
echo.

where python >nul 2>&1 && set "PY=python" && goto :run
where py >nul 2>&1 && set "PY=py -3" && goto :run
where python3 >nul 2>&1 && set "PY=python3" && goto :run

echo Не найден Python 3.
pause
exit /b 1

:run
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul && start "" "%URL%""
%PY% -m http.server %PORT% --bind 127.0.0.1
pause