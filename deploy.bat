@echo off
echo Building and deploying...

cd frontend
npm run build
cd ..
xcopy frontend\build\* . /E /Y /I

git add .
git commit -m "Update"
git checkout gh-pages
git merge main
git push origin gh-pages
git checkout main

echo Deployment complete!
pause