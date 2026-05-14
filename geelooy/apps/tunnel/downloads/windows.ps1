
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
$app = Join-Path $root "awtsmoos-local-app.js"
$stamp = Join-Path $root "last-bootstrap.txt"

New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "Downloading latest Awtsmoos local control app..."
Invoke-WebRequest -Uri "https://awtsmoos.com/api/tunnel/install/local-app" -OutFile $app

Write-Utf8NoBom $stamp ("Bootstrapped at " + (Get-Date).ToString("s"))

Write-Host ""
Write-Host "Starting Awtsmoos local control panel..." -ForegroundColor Green
Write-Host "The browser should open automatically."
Write-Host ""

node $app
