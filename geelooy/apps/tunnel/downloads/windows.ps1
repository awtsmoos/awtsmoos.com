# B"H
$ErrorActionPreference = "Stop"

Write-Host 'B"H Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan

function Write-Utf8NoBom($path, $text) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $encoding)
}

function Read-AwtsJson($path) {
  if (-not (Test-Path $path)) { return $null }
  try { return (Get-Content -Raw -Path $path | ConvertFrom-Json) } catch { return $null }
}

function Test-AwtsAgentUpToDate($root, $manifest, $state) {
  if ($null -eq $manifest -or $null -eq $state) { return $false }
  if ($state.version -ne $manifest.version) { return $false }
  if (-not (Test-Path (Join-Path $root $manifest.entry))) { return $false }
  return $true
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$config = Join-Path $root "config.json"
$statePath = Join-Path $root "install-state.json"
$manifestUrl = "https://awtsmoos.com/apps/tunnel/agent/manifest.json"

New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "Checking Awtsmoos agent manifest..."
$manifest = Invoke-RestMethod -Uri $manifestUrl
$state = Read-AwtsJson $statePath

if (Test-AwtsAgentUpToDate $root $manifest $state) {
  Write-Host "Awtsmoos agent version $($manifest.version) is already installed. Restarting only." -ForegroundColor Green
} else {
  Write-Host "Installing Awtsmoos agent version $($manifest.version)..."
  foreach ($path in $manifest.files) {
    $dest = Join-Path $root $path
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Invoke-WebRequest -Uri ("https://awtsmoos.com/apps/tunnel/agent/" + $path) -OutFile $dest
  }

  @{
    BH = 'B"H'
    version = $manifest.version
    entry = $manifest.entry
    installedAt = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $statePath
}

Write-Host ""
Write-Host "Starting Awtsmoos background agent..." -ForegroundColor Green
& node (Join-Path $root "main.js") --open-control