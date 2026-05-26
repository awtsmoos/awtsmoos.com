# B"H
$ErrorActionPreference = "Stop"
 
Write-Host 'B"H Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan
 
function Write-Utf8NoBom($path, $text) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $encoding)
}
 
function Stop-OldAwtsAgent($root, $entry) {
  Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and
    $_.CommandLine -match "node" -and
    $_.CommandLine -match [Regex]::Escape((Join-Path $root $entry))
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
 
$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$config = Join-Path $root "config.json"
$statePath = Join-Path $root "install-state.txt"
$manifestUrl = "https://awtsmoos.com/apps/tunnel/agent/manifest.txt"
$baseUrl = "https://awtsmoos.com/apps/tunnel/agent"
 
New-Item -ItemType Directory -Force -Path $root | Out-Null
 
if (-not (Test-Path $config)) {
  $cfg = @{
    BH = 'B"H'
    relay = "wss://awtsmoos.com"
    tunnelName = "awt-$($env:USERNAME)-$(Get-Random -Minimum 1000 -Maximum 9999)"
    local = "http://localhost:3000"
    root = (Get-Location).Path
    allowWrite = $true
    allowSecrets = $false
    enableLocalHttpProxy = $true
  } | ConvertTo-Json -Depth 8
 
  Write-Utf8NoBom $config $cfg
} else {
  Write-Host "Existing config found. Reusing same tunnel name and settings."
}
 
Write-Host "Checking Awtsmoos agent manifest..."
$lines = (Invoke-WebRequest -Uri $manifestUrl -UseBasicParsing).Content -split "`r?`n"
$lines = $lines | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
 
$version = $lines[1]
$entry = $lines[2]
$files = $lines | Select-Object -Skip 3
 
$oldVersion = ""
if (Test-Path $statePath) {
  $oldVersion = (Get-Content -Raw $statePath).Trim()
}
 
if ($oldVersion -eq $version -and (Test-Path (Join-Path $root $entry))) {
  Write-Host "Awtsmoos agent version $version is already installed. Restarting only." -ForegroundColor Green
} else {
  Write-Host "Installing Awtsmoos agent version $version..."
 
  foreach ($path in $files) {
    $dest = Join-Path $root $path
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Write-Host "Downloading $path..."
    Invoke-WebRequest -Uri "$baseUrl/$path" -OutFile $dest
  }
 
  Write-Utf8NoBom $statePath $version
}
 
Stop-OldAwtsAgent $root $entry
 
Write-Host ""
Write-Host "Starting Awtsmoos background agent..." -ForegroundColor Green
& node (Join-Path $root $entry) --open-control