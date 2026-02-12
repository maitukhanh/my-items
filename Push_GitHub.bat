@echo off
set "PATH=%~dp0git\bin;%PATH%"
echo === Cap Nhat Code Len GitHub ===
echo.
git add .
git commit -m "Update code for Vercel deployment"
git push origin main
echo.
echo === Da cap nhat xong! ===
echo Vercel se tu dong deploy lai trong vong 1-2 phut.
pause
