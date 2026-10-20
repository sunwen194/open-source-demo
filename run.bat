@echo off
chcp 65001 >nul
cd /d %~dp0
echo ============================================
echo   高速公路广告牌管理系统  启动中...
echo ============================================
start "" http://127.0.0.1:8000
python backend/server.py --port 8000
pause
