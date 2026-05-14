
# B"H
$ErrorActionPreference = "Stop"

Write-Host 'B"H Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan

function Test-AwtsCommand($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Write-Utf8NoBom($path, $text) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $encoding)
}

if (-not (Test-AwtsCommand "node")) {
  Write-Host ""
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Write-Host "Please install Node.js LTS from https://nodejs.org/ then run this command again."
  Start-Process "https://nodejs.org/"
  exit 1
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$agent = Join-Path $root "awtsmoos-agent.js"
$config = Join-Path $root "config.json"

New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "Downloading latest Awtsmoos agent..."
Invoke-WebRequest -Uri "https://awtsmoos.com/api/tunnel/install/agent" -OutFile $agent

if (-not (Test-Path $config)) {
  $cleanUser = ($env:USERNAME.ToLower() -replace "[^a-z0-9_-]+", "-").Trim("-")
  if ([string]::IsNullOrWhiteSpace($cleanUser)) { $cleanUser = "user" }

  $defaultName = "awt-" + $cleanUser + "-" + (Get-Random -Minimum 1000 -Maximum 9999)

  $cfg = @{
    relay = "wss://awtsmoos.com"
    tunnelName = $defaultName
    local = "http://localhost:3000"
    root = (Get-Location).Path
    allowWrite = $true
    allowSecrets = $false
    enableLocalHttpProxy = $true
  } | ConvertTo-Json -Depth 5

  Write-Utf8NoBom $config $cfg
}

Write-Host ""
Write-Host "Starting Awtsmoos background agent..." -ForegroundColor Green
Write-Host "The hosted control panel should open automatically."
Write-Host ""

node $agent --open-control
