$BH="BH"
$ErrorActionPreference = 'Stop'
Write-Host 'Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan

function Write-Utf8NoBom($path, $text) { $encoding = New-Object System.Text.UTF8Encoding($false); [System.IO.File]::WriteAllText($path, $text, $encoding) }
function Download-Text($url) { $wc = New-Object System.Net.WebClient; $wc.Encoding = [System.Text.Encoding]::UTF8; return $wc.DownloadString($url).TrimStart([char]0xFEFF) }
function Stop-OldAwtsAgent($root, $entry) {
  $agentPath = [Regex]::Escape((Join-Path $root $entry))
  Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'node' -and $_.CommandLine -match $agentPath } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
function Get-ManifestLines($text) {
  return @([regex]::Split($text, '\r?\n') | ForEach-Object { $_.Trim().TrimStart([char]0xFEFF) } | Where-Object { $_ -ne '' -and $_ -ne 'B"H' -and $_ -ne '# B"H' })
}
function Test-AllManifestFiles($root, $entry, $files) {
  if (-not (Test-Path (Join-Path $root $entry))) { return $false }
  foreach ($filePath in $files) { if (-not (Test-Path (Join-Path $root $filePath))) { return $false } }
  return $true
}
function Install-AwtsmoosFiles($root, $baseUrl, $files) {
  foreach ($filePath in $files) {
    $dest = Join-Path $root $filePath
    $parent = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Write-Host ('Downloading ' + $filePath + '...')
    Invoke-WebRequest -Uri ($baseUrl + '/' + $filePath) -OutFile $dest
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
  $cfg = @{ BH = 'BH'; relay = 'wss://awtsmoos.com'; tunnelName = $name; local = 'http://localhost:3000'; root = (Get-Location).Path; allowWrite = $true; allowSecrets = $false; enableLocalHttpProxy = $true } | ConvertTo-Json -Depth 8
  Write-Utf8NoBom $config $cfg
}

Write-Host 'Checking Awtsmoos manifest...'
$manifestText = Download-Text $manifestUrl
$lines = Get-ManifestLines $manifestText
if ($lines.Count -lt 2) { throw ('Manifest is missing version and entry.') }
$version = $lines[0]
$entry = $lines[1]
$files = @($lines | Select-Object -Skip 2)
if ($entry -ne 'main.js') { throw ('Bad manifest entry: ' + $entry) }
if ($files.Count -lt 1) { throw 'Manifest has no files.' }
$installedVersion = ''
if (Test-Path $statePath) { $installedVersion = (Get-Content -Raw $statePath).Trim() }
$hasCompleteInstall = Test-AllManifestFiles $root $entry $files
if ($installedVersion -eq $version -and $hasCompleteInstall) { Write-Host ('Awtsmoos version ' + $version + ' already installed and complete.') }
else {
  if ($installedVersion -eq $version) { Write-Host ('Repairing incomplete Awtsmoos version ' + $version + '...') } else { Write-Host ('Installing Awtsmoos version ' + $version + '...') }
  Install-AwtsmoosFiles $root $baseUrl $files
  Write-Utf8NoBom $statePath $version
}
Stop-OldAwtsAgent $root $entry
Write-Host ''
Write-Host 'Starting Awtsmoos background agent...' -ForegroundColor Green
& node (Join-Path $root $entry) --open-control
