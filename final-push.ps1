# ===================================================
# FINAL-PUSH.ps1 — Run this after fixing GitHub token
# ===================================================
# This script pushes your code to GitHub and triggers
# an auto-deploy on Render.
# ===================================================

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$TOKEN = Read-Host "Paste your updated GitHub token (with Contents: Read and Write)"
$RENDER_KEY = "rnd_5jLqkMGdjVlrLUOFygX9tjuY0sq5"
$SERVICE_ID = "srv-d6kodcrh46gs73d2ucig"

Set-Location "c:\Users\user\Documents\Logan's Area\Meta funnel"

# Update remote with new token
git remote set-url origin "https://x-access-token:$TOKEN@github.com/whatapi00-max/whatsapp-crm.git"
Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push origin master --force 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Push failed. Make sure the token has 'Contents: Read and write' permission." -ForegroundColor Red
    exit 1
}

Write-Host "`n[OK] Code pushed to GitHub!" -ForegroundColor Green

# Trigger Render deploy
Write-Host "Triggering Render deploy..." -ForegroundColor Cyan
$rHeaders = @{ "Authorization" = "Bearer $RENDER_KEY"; "Accept" = "application/json" }
$resp = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$SERVICE_ID/deploys" -Method POST -Headers $rHeaders -Body "{}" -ContentType "application/json"
Write-Host "[OK] Render deploy triggered! Deploy ID: $($resp.deploy.id)" -ForegroundColor Green

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "ALL DONE! Summary:" -ForegroundColor Cyan
Write-Host "  Frontend : https://frontend-five-beta-55.vercel.app" -ForegroundColor Green
Write-Host "  Backend  : https://whatsapp-crm-17n3.onrender.com" -ForegroundColor Green
Write-Host "  Health   : https://whatsapp-crm-17n3.onrender.com/api/health" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Render's free tier spins down after 15 min of inactivity." -ForegroundColor Yellow
Write-Host "First request after sleep may take 30-60 sec. Backend stays warm with traffic." -ForegroundColor Yellow
