@echo off
echo Building and deploying...

cd frontend
npm run build
cd ..
xcopy frontend\build\* . /E /Y /I

git add .
git commit -m "Update deployment"
git push origin main

echo Deployment complete!
pause