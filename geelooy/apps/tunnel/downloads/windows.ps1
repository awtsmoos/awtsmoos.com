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

function Test-AwtsCommand($name) {
  return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
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
    $procs = Get-CimInstance Win32_Process | Where-Object {
      $_.CommandLine -and $_.CommandLine -match "node" -and $_.CommandLine -match $escaped
    }
    foreach ($p in $procs) {
      Write-Host "Stopping old Awtsmoos agent PID $($p.ProcessId)..."
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
  } catch {
    Write-Host "Could not scan old agent processes. Continuing..."
  }
}

function Test-AwtsAgentUpToDate($root, $manifest, $state) {
  if ($null -eq $manifest -or $null -eq $state) { return $false }
  if ($state.version -ne $manifest.version) { return $false }
  if (-not (Test-Path (Join-Path $root $manifest.entry))) { return $false }
  return $true
}

function Write-AwtsInstallState($statePath, $manifest) {
  $installedState = @{
    BH = 'B"H'
    version = $manifest.version
    entry = $manifest.entry
    installedAt = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json -Depth 8

  Write-Utf8NoBom $statePath $installedState
}

if (-not (Test-AwtsCommand "node")) {
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Start-Process "https://nodejs.org/"
  exit 1
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$config = Join-Path $root "config.json"
$statePath = Join-Path $root "install-state.json"
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

Write-Host "Checking Awtsmoos agent manifest..."
$manifest = Invoke-RestMethod -Uri $manifestUrl
$state = Read-AwtsJson $statePath

if (Test-AwtsAgentUpToDate $root $manifest $state) {
  Write-Host "Awtsmoos agent version $($manifest.version) is already installed. Restarting only." -ForegroundColor Green
} else {
  Write-Host "Installing Awtsmoos agent version $($manifest.version)..."

  foreach ($file in $manifest.files) {
    $path = if ($file.path) { $file.path } else { $file }
    $dest = Join-Path $root $path
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    $url = "https://awtsmoos.com/apps/tunnel/agent/" + $path
    Write-Host "Downloading $path..."
    Invoke-WebRequest -Uri $url -OutFile $dest
  }

  Write-AwtsInstallState $statePath $manifest
}

Write-Host ""
Write-Host "Starting Awtsmoos background agent..." -ForegroundColor Green
node (Join-Path $root "main.js") --open-control
