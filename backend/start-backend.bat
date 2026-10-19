@echo off
cd /d "%~dp0"
echo Starting Hostel Management Backend...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo ERROR: Port 8080 is already in use by process %%a
    echo Stop the other backend instance first, then run this script again.
    echo.
    echo To stop it: taskkill /PID %%a /F
    pause
    exit /b 1
)

echo Required: Java 17 or 21
java -version 2>&1
echo.
mvn spring-boot:run -DskipTests
if errorlevel 1 (
    echo.
    echo Backend failed to start. Common fixes:
    echo   1. Stop any other backend already running on port 8080
    echo   2. Install JDK 17 or 21 and set JAVA_HOME
    echo   3. Run: mvn clean compile -DskipTests
    pause
)
