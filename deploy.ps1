# ============================================================
# Meta Funnel — Automated Deploy Script
# Frontend → Vercel   |   Backend → Render (via render.yaml)
# ============================================================
#
# USAGE:
#   .\deploy.ps1
#
# You will be prompted for all required credentials.
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ROOT   = Split-Path -Parent $MyInvocation.MyCommand.Path
$FRONT  = Join-Path $ROOT "frontend"
$BACK   = Join-Path $ROOT "backend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Meta Funnel — Automated Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Helper ──────────────────────────────────────────────────
function Prompt-Secret($label) {
    $secure = Read-Host -Prompt $label -AsSecureString
    $BSTR   = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    return  [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# ── Collect credentials ──────────────────────────────────────
Write-Host "Please enter your credentials." -ForegroundColor Yellow
Write-Host "(All values stay on your machine — nothing is stored.)" -ForegroundColor DarkGray
Write-Host ""

$SUPABASE_URL         = Read-Host "Supabase Project URL (e.g. https://xxxx.supabase.co)"
$SUPABASE_SERVICE_KEY = Prompt-Secret "Supabase SERVICE ROLE key"
$SUPABASE_ANON_KEY    = Prompt-Secret "Supabase ANON key"
$JWT_SECRET           = Prompt-Secret "JWT secret (long random string, min 32 chars)"

Write-Host ""
Write-Host "-- Frontend (Vercel) --" -ForegroundColor Cyan
$SITE_URL = Read-Host "Your Vercel app URL (leave blank to auto-detect after deploy, e.g. https://myapp.vercel.app)"

Write-Host ""
Write-Host "-- Backend (Render) --" -ForegroundColor Cyan
$RENDER_API_KEY = Prompt-Secret "Render API key (dashboard.render.com → Account → API Keys)"

# ── Step 1: Build & deploy frontend to Vercel ───────────────
Write-Host ""
Write-Host "[1/3] Deploying frontend to Vercel..." -ForegroundColor Green
Set-Location $FRONT

# Write temp .env.production.local for the build
$envContent = @"
NEXT_PUBLIC_API_URL=__REPLACE_AFTER_BACKEND_DEPLOY__
NEXT_PUBLIC_SITE_URL=$SITE_URL
"@
Set-Content -Path (Join-Path $FRONT ".env.production.local") -Value $envContent

# Deploy (non-interactive, prod)
$vercelOutput = vercel --prod --yes 2>&1
Write-Host $vercelOutput

# Extract the deployment URL from the last line that looks like a URL
$deployedUrl = ($vercelOutput | Select-String "https://.*\.vercel\.app" | Select-Object -Last 1).Matches[0].Value
if (-not $deployedUrl) {
    $deployedUrl = $SITE_URL
}
Write-Host "  Frontend URL: $deployedUrl" -ForegroundColor Green

# Clean up temp env file (keep .env.local.example safe)
Remove-Item -ErrorAction SilentlyContinue (Join-Path $FRONT ".env.production.local")

# ── Step 2: Deploy backend to Render via API ─────────────────
Write-Host ""
Write-Host "[2/3] Creating backend service on Render..." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $RENDER_API_KEY"
    "Content-Type"  = "application/json"
}

# Check existing services
$existing = Invoke-RestMethod -Uri "https://api.render.com/v1/services?limit=20" `
    -Method GET -Headers $headers -ErrorAction SilentlyContinue

$serviceId = $null
if ($existing.services) {
    $found = $existing.services | Where-Object { $_.service.name -eq "meta-funnel-backend" }
    if ($found) { $serviceId = $found.service.id }
}

if (-not $serviceId) {
    Write-Host "  Creating new Render web service..." -ForegroundColor DarkGray
    $body = @{
        type           = "web_service"
        name           = "meta-funnel-backend"
        ownerId        = ""          # filled automatically from API key owner
        autoDeploy     = "yes"
        serviceDetails = @{
            runtime      = "node"
            buildCommand = "npm install"
            startCommand = "npm start"
            envVars      = @(
                @{ key = "NODE_ENV";            value = "production" }
                @{ key = "SUPABASE_URL";        value = $SUPABASE_URL }
                @{ key = "SUPABASE_SERVICE_KEY"; value = $SUPABASE_SERVICE_KEY }
                @{ key = "SUPABASE_ANON_KEY";   value = $SUPABASE_ANON_KEY }
                @{ key = "JWT_SECRET";           value = $JWT_SECRET }
                @{ key = "FRONTEND_URL";         value = $deployedUrl }
            )
        }
    } | ConvertTo-Json -Depth 10

    # Note: Render's API requires a GitHub repo to be connected.
    # The render.yaml Blueprint method is preferred — instructions below.
    Write-Host ""
    Write-Host "  NOTE: Render requires a connected GitHub repository." -ForegroundColor Yellow
    Write-Host "  Skipping auto-create. See instructions below." -ForegroundColor Yellow
    $serviceId = $null
} else {
    Write-Host "  Found existing service: $serviceId" -ForegroundColor Gray
}

# ── Step 3: Update Vercel with real backend URL ───────────────
if ($serviceId) {
    $svc = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" `
        -Method GET -Headers $headers
    $backendUrl = "https://$($svc.service.serviceDetails.url)"

    Write-Host ""
    Write-Host "[3/3] Updating Vercel env with backend URL: $backendUrl" -ForegroundColor Green

    # Re-deploy Vercel with real API URL
    Set-Location $FRONT
    $env:NEXT_PUBLIC_API_URL = $backendUrl
    vercel env add NEXT_PUBLIC_API_URL production --force 2>&1 | Out-Null
    vercel --prod --yes 2>&1 | Out-Null
    Write-Host "  Frontend re-deployed with correct API URL." -ForegroundColor Green
}

# ── Summary ──────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend (Vercel):  $deployedUrl" -ForegroundColor Green
if ($serviceId) {
    Write-Host "Backend  (Render):  $backendUrl" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ACTION REQUIRED — Backend (Render):" -ForegroundColor Yellow
    Write-Host "  1. Push this project to a GitHub repository." -ForegroundColor White
    Write-Host "  2. Go to https://dashboard.render.com/blueprints" -ForegroundColor White
    Write-Host "  3. Click 'New Blueprint Instance', connect your repo." -ForegroundColor White
    Write-Host "  4. Render detects render.yaml automatically and creates the service." -ForegroundColor White
    Write-Host "  5. In the Render service environment, add these variables:" -ForegroundColor White
    Write-Host "       SUPABASE_URL         = $SUPABASE_URL" -ForegroundColor Gray
    Write-Host "       SUPABASE_SERVICE_KEY = (your service key)" -ForegroundColor Gray
    Write-Host "       SUPABASE_ANON_KEY    = (your anon key)" -ForegroundColor Gray
    Write-Host "       JWT_SECRET           = (your jwt secret)" -ForegroundColor Gray
    Write-Host "       FRONTEND_URL         = $deployedUrl" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  6. Copy the Render service URL." -ForegroundColor White
    Write-Host "  7. In Vercel project settings → Environment Variables, add:" -ForegroundColor White
    Write-Host "       NEXT_PUBLIC_API_URL  = https://your-service.onrender.com" -ForegroundColor Gray
    Write-Host "       NEXT_PUBLIC_SITE_URL = $deployedUrl" -ForegroundColor Gray
    Write-Host "  8. Redeploy Vercel (one click in Vercel dashboard)." -ForegroundColor White
}
Write-Host ""
