@echo off
echo Deploying Crop2Door to GitHub Pages and Render...

echo.
echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Updated deployment configuration"

echo.
echo Pushing to GitHub (this will trigger both GitHub Pages and Render deployment)...
git push origin main

echo.
echo Deployment initiated!
echo - GitHub Pages will rebuild frontend automatically
echo - Render will redeploy backend automatically
echo.
echo Check your deployment status:
echo Frontend: https://github.com/yourusername/farm2home/actions
echo Backend: https://dashboard.render.com
pause