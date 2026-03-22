@echo off
chcp 65001 >nul
cd /d "%~dp0frontend"

REM 改成你 GitHub 仓库的真实名字（和 https://sen-illion.github.io/这里/ 一致）
set VITE_BASE_PATH=/H------/

call npm run build:pages:standalone
if errorlevel 1 (
  echo 构建失败，请先在此目录执行 npm install
  pause
  exit /b 1
)

echo.
echo 构建完成。请到项目根目录执行：
echo   git add docs
echo   git commit -m "更新 GitHub Pages"
echo   git push origin main
echo.
pause
