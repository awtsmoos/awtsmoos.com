
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

function Clean-AwtsName($value) {
  $clean = $value.ToLower() -replace "[^a-z0-9_-]+", "-"
  $clean = $clean.Trim("-")
  if ([string]::IsNullOrWhiteSpace($clean)) { return "user" }
  return $clean
}

function Stop-OldAwtsAgent($root) {
  try {
    $escaped = [Regex]::Escape($root)
    $procs = Get-CimInstance Win32_Process |
      Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match "node" -and
        $_.CommandLine -match $escaped
      }

    foreach ($p in $procs) {
      Write-Host "Stopping old Awtsmoos agent PID $($p.ProcessId)..."
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
  } catch {
    Write-Host "Could not scan old agent processes. Continuing..."
  }
}

if (-not (Test-AwtsCommand "node")) {
  Write-Host ""
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Write-Host "Please install Node.js LTS from https://nodejs.org/ then run this command again."
  Start-Process "https://nodejs.org/"
  exit 1
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$config = Join-Path $root "config.json"
$manifestUrl = "https://awtsmoos.com/apps/tunnel/agent/manifest.json"

New-Item -ItemType Directory -Force -Path $root | Out-Null

if (-not (Test-Path $config)) {
  $cleanUser = Clean-AwtsName $env:USERNAME
  $defaultName = "awt-" + $cleanUser + "-" + (Get-Random -Minimum 1000 -Maximum 9999)

  $cfg = @{
    relay = "wss://awtsmoos.com"
    tunnelName = $defaultName
    local = "http://localhost:3000"
    root = (Get-Location).Path
    allowWrite = $true
    allowSecrets = $false
    enableLocalHttpProxy = $true
    chrome = @{
      enabled = $false
      port = 9222
      path = ""
      userDataDir = ""
    }
  } | ConvertTo-Json -Depth 8

  Write-Utf8NoBom $config $cfg
} else {
  Write-Host "Existing config found. Reusing same tunnel name and settings."
}

Stop-OldAwtsAgent $root

Write-Host "Downloading Awtsmoos agent manifest..."
$manifest = Invoke-RestMethod -Uri $manifestUrl

foreach ($file in $manifest.files) {
  $dest = Join-Path $root $file.path
  $destDir = Split-Path $dest -Parent

  New-Item -ItemType Directory -Force -Path $destDir | Out-Null

  $url = "https://awtsmoos.com/apps/tunnel/agent/" + $file.path
  Write-Host "Downloading $($file.path)..."
  Invoke-WebRequest -Uri $url -OutFile $dest
}

Write-Host ""
Write-Host "Starting Awtsmoos background agent..." -ForegroundColor Green
Write-Host "The hosted control panel should open automatically."
Write-Host ""

node (Join-Path $root "main.js") --open-control
