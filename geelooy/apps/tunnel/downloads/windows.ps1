
# B"H
$ErrorActionPreference = "Stop"

Write-Host "B`"H Awtsmoos Tunnel Installer" -ForegroundColor Cyan

function Test-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

if (-not (Test-Command "node")) {
  Write-Host ""
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Write-Host "Please install Node.js LTS from https://nodejs.org/ then run this command again."
  Start-Process "https://nodejs.org/"
  exit 1
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$client = Join-Path $root "awtsmoos-tunnel-client.js"
$config = Join-Path $root "config.json"
$package = Join-Path $root "package.json"

New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "Downloading tunnel client..."
Invoke-WebRequest -Uri "https://awtsmoos.com/geelooy/apps/tunnel/downloads/awtsmoos-tunnel-client.js" -OutFile $client

if (-not (Test-Path $package)) {
  '{"dependencies":{"ws":"latest"}}' | Set-Content -Encoding UTF8 $package
}

Push-Location $root
Write-Host "Installing ws dependency..."
npm install --silent
Pop-Location

$defaultName = "awt-" + $env:USERNAME.ToLower() + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
$tunnelName = Read-Host "Tunnel name [$defaultName]"
if ([string]::IsNullOrWhiteSpace($tunnelName)) { $tunnelName = $defaultName }

$defaultProject = (Get-Location).Path
$projectRoot = Read-Host "Project folder to expose [$defaultProject]"
if ([string]::IsNullOrWhiteSpace($projectRoot)) { $projectRoot = $defaultProject }

$writeAnswer = Read-Host "Allow writing files? Type YES to allow, anything else for read-only"
$allowWrite = $false
if ($writeAnswer -eq "YES") { $allowWrite = $true }

$configObject = @{
  relay = "wss://awtsmoos.com"
  tunnelName = $tunnelName
  local = "http://localhost:3000"
  root = $projectRoot
  allowWrite = $allowWrite
}

$configObject | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $config

Write-Host ""
Write-Host "B`"H tunnel config saved to $config" -ForegroundColor Green
Write-Host "Starting tunnel..."
Write-Host ""
Write-Host "Paste into your GPT:" -ForegroundColor Cyan
Write-Host "tunnelName: $tunnelName"
Write-Host "project path: ."
Write-Host ""

node $client
