@echo off
title Deploy to Cloudflare (larpifyy.asia)
cd /d "%~dp0"
echo ========================================================
echo  Deploying AuthShield & Bio to Cloudflare (larpifyy.asia)
echo ========================================================
echo.
npx wrangler deploy
echo.
pause
