
$ErrorActionPreference = 'Stop'
 
Write-Host 'Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan
 
function Write-Utf8NoBom($path, $text) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $encoding)
}
 
function Stop-OldAwtsAgent($root, $entry) {
  $agentPath = [Regex]::Escape((Join-Path $root $entry))
  Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and $_.CommandLine -match 'node' -and $_.CommandLine -match $agentPath
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
 
$root = Join-Path $env:USERPROFILE '.awtsmoos-tunnel'
$config = Join-Path $root 'config.json'
$statePath = Join-Path $root 'install-state.txt'
$manifestUrl = 'https://awtsmoos.com/apps/tunnel/agent/manifest.txt'
$baseUrl = 'https://awtsmoos.com/apps/tunnel/agent'
 
New-Item -ItemType Directory -Force -Path $root | Out-Null
 
if (-not (Test-Path $config)) {
  $name = 'awt-' + $env:USERNAME + '-' + (Get-Random -Minimum 1000 -Maximum 9999)
 
  $cfg = @{
    BH = 'BH'
    relay = 'wss://awtsmoos.com'
    tunnelName = $name
    local = 'http://localhost:3000'
    root = (Get-Location).Path
    allowWrite = $true
    allowSecrets = $false
    enableLocalHttpProxy = $true
  } | ConvertTo-Json -Depth 8
 
  Write-Utf8NoBom $config $cfg
}
 
Write-Host 'Checking Awtsmoos manifest...'
 
$manifestText = (Invoke-WebRequest -Uri $manifestUrl -UseBasicParsing).Content
$lines = @(
  [regex]::Split($manifestText, '\r?\n') |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -ne '' }
)

if ($lines.Count -lt 4) {
  $lines = @(
    [regex]::Split($manifestText, '\s+') |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -ne '' }
  )
}

if ($lines[0] -eq 'B"H') {
  $version = $lines[1]
  $entry = $lines[2]
  $files = $lines | Select-Object -Skip 3
} else {
  $version = $lines[0]
  $entry = $lines[1]
  $files = $lines | Select-Object -Skip 2
}

if ([string]::IsNullOrWhiteSpace($version)) { throw 'Missing manifest version' }
if ([string]::IsNullOrWhiteSpace($entry)) { throw 'Missing manifest entry' }
if ($entry -ne 'main.js') { throw "Bad manifest entry: $entry" }
 
$installedVersion = ''
 
if (Test-Path $statePath) {
  $installedVersion = (Get-Content -Raw $statePath).Trim()
}
 
$entryPath = Join-Path $root $entry
 
if ($installedVersion -eq $version -and (Test-Path $entryPath)) {
  Write-Host ('Awtsmoos version ' + $version + ' already installed.')
} else {
  Write-Host ('Installing Awtsmoos version ' + $version + '...')
 
  foreach ($filePath in $files) {
    $dest = Join-Path $root $filePath
    $parent = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
 
    $url = $baseUrl + '/' + $filePath
    Write-Host ('Downloading ' + $filePath + '...')
    Invoke-WebRequest -Uri $url -OutFile $dest
  }
 
  Write-Utf8NoBom $statePath $version
}
 
Stop-OldAwtsAgent $root $entry
 
Write-Host ''
Write-Host 'Starting Awtsmoos background agent...' -ForegroundColor Green
 
& node $entryPath --open-control