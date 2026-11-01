@echo off
title Cloudflare D1 Setup & Deploy (larpifyy.asia)
cd /d "%~dp0"
echo ========================================================
echo  Step 1: Authenticating with Cloudflare...
echo  (Your browser will open to click 'Allow')
echo ========================================================
call npx wrangler login
echo.
echo ========================================================
echo  Step 2: Creating D1 Database 'larpifyy-db'...
echo ========================================================
call npx wrangler d1 create larpifyy-db
echo.
echo ========================================================
echo  If database was created, copy the database_id shown above!
echo ========================================================
pause
