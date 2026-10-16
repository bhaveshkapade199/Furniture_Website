@echo off
title Bhavesh Furniture Starter
echo ====================================================
echo   Starting Bhavesh Furniture Full Stack Application
echo ====================================================
echo.
echo [1/2] Starting Node.js MongoDB Backend (Port 5000)...
start "Bhavesh Furniture Backend" cmd /k "cd /d %~dp0backend && npm start"

echo [2/2] Starting Angular Frontend Website (Port 4200)...
start "Bhavesh Furniture Website" cmd /k "cd /d %~dp0furniture-website && npm start"

echo.
echo Both servers are starting up!
echo.
echo   Website Pages:
echo   * Home:          http://localhost:4200
echo   * Gallery:       http://localhost:4200/gallery
echo   * Make Furniture:http://localhost:4200/custom-order  ^<-- NEW!
echo   * Contact:       http://localhost:4200/contact
echo   * Admin Portal:  http://localhost:4200/admin
echo.
echo   Admin Password:  bhavesh@admin123
echo   Backend API:     http://localhost:5000
echo   MongoDB:         mongodb://localhost:27017/bhavesh_furniture
echo.
echo   API Endpoints:
echo   * GET/POST  /api/custom-orders        (public POST, admin GET)
echo   * PATCH     /api/custom-orders/:id    (admin only)
echo   * DELETE    /api/custom-orders/:id    (admin only)
echo ====================================================
pause
