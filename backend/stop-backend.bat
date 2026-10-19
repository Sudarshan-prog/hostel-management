@echo off
cd /d "%~dp0"
echo Stopping Hostel Management Backend on port 8080...
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    set FOUND=1
    echo Found process %%a on port 8080
    taskkill /PID %%a /F /T
    if errorlevel 1 (
        echo.
        echo Could not stop PID %%a automatically.
        echo Try one of these:
        echo   1. Open Task Manager -^> Details -^> end java.exe with PID %%a
        echo   2. Run this script as Administrator
        echo   3. Restart your computer
        echo.
        pause
        exit /b 1
    )
)

if "%FOUND%"=="0" (
    echo No backend found on port 8080.
) else (
    echo Backend stopped.
)

pause
