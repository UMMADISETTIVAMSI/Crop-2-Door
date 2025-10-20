Write-Host "Building and deploying..." -ForegroundColor Green

cd frontend
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

cd ..
xcopy frontend\build\* . /E /Y /I
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

git add .
git commit -m "Update"
git checkout gh-pages
git merge main
git push origin gh-pages
git checkout main

Write-Host "Deployment complete!" -ForegroundColor Green
Read-Host "Press Enter to continue"