$BH="BH"
$ErrorActionPreference = 'Stop'
Write-Host 'Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan

function EnvOr($name, $fallback) { $v = [Environment]::GetEnvironmentVariable($name); if ([string]::IsNullOrWhiteSpace($v)) { return $fallback }; return $v }
function IsTrueEnv($name) { $v = (EnvOr $name ''); return @('1','true','yes','on') -contains $v.ToLowerInvariant() }
function Write-Utf8NoBom($path, $text) { $encoding = New-Object System.Text.UTF8Encoding($false); [System.IO.File]::WriteAllText($path, $text, $encoding) }
function Download-Text($url) { $wc = New-Object System.Net.WebClient; $wc.Encoding = [System.Text.Encoding]::UTF8; try { return $wc.DownloadString($url).TrimStart([char]0xFEFF) } finally { $wc.Dispose() } }
function Get-Sha256Text($text) { $sha = [System.Security.Cryptography.SHA256]::Create(); try { $bytes = [System.Text.Encoding]::UTF8.GetBytes($text); return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant() } finally { $sha.Dispose() } }
function Stop-OldAwtsAgent($root, $entry) { $agentPath = [Regex]::Escape((Join-Path $root $entry)); Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'node' -and $_.CommandLine -match $agentPath } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }
function Get-ManifestLines($text) { return @([regex]::Split($text, '\r?\n') | ForEach-Object { $_.Trim().TrimStart([char]0xFEFF) } | Where-Object { $_ -ne '' -and $_ -ne 'B"H' -and $_ -ne '# B"H' }) }
function Test-SafeRelativePath($filePath) { if ([string]::IsNullOrWhiteSpace($filePath)) { return $false }; if ($filePath.StartsWith('/') -or $filePath.StartsWith('\') -or $filePath.Contains('..') -or $filePath -match '\s') { return $false }; return $true }
function Test-AllManifestFiles($root, $entry, $files) { if (-not (Test-Path (Join-Path $root $entry))) { return $false }; foreach ($filePath in $files) { if (-not (Test-SafeRelativePath $filePath)) { throw ('Unsafe manifest path: ' + $filePath) }; if (-not (Test-Path (Join-Path $root $filePath))) { return $false } }; return $true }
function Test-ZipSignature($path) {
  if (-not (Test-Path $path)) { return $false }
  $fs = [System.IO.File]::OpenRead($path)
  try {
    if ($fs.Length -lt 4) { return $false }
    $bytes = New-Object byte[] 4
    [void]$fs.Read($bytes, 0, 4)
    return ($bytes[0] -eq 0x50 -and $bytes[1] -eq 0x4b -and $bytes[2] -eq 0x03 -and $bytes[3] -eq 0x04)
  } finally { $fs.Dispose() }
}
function Install-AwtsmoosBundles($root, $origin) {
  $bundleManifestUrl = $origin.TrimEnd('/') + '/api/tunnel/install/bundle-manifest'
  Write-Host 'Installing from Awtsmoos ZIP bundle...'
  $bundleManifest = (Download-Text $bundleManifestUrl) | ConvertFrom-Json
  if (-not $bundleManifest.bundles -or $bundleManifest.bundles.Count -lt 1) { throw 'No bundles returned. Bundle install is required.' }
  $tmp = Join-Path $root '.bundle-downloads'
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $client = New-Object System.Net.WebClient
  try {
    foreach ($bundle in $bundleManifest.bundles) {
      $zipPath = Join-Path $tmp ($bundle.name + '.zip')
      $url = if ([string]$bundle.url -match '^https?://') { [string]$bundle.url } else { $origin.TrimEnd('/') + $bundle.url }
      Write-Host ('Downloading bundle ' + $bundle.name + '...')
      $client.DownloadFile($url, $zipPath)
      if (-not (Test-ZipSignature $zipPath)) { throw ('Downloaded bundle ' + $bundle.name + ' is not a ZIP archive: ' + $url) }
      Write-Host ('Expanding bundle ' + $bundle.name + '...')
      Expand-Archive -Force -Path $zipPath -DestinationPath $root
    }
  } finally { $client.Dispose(); Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
}

$origin = (EnvOr 'AWTSMOOS_INSTALL_ORIGIN' 'https://awtsmoos.com').TrimEnd('/')
$defaultRoot = Join-Path $env:USERPROFILE '.awtsmoos-tunnel'
$root = EnvOr 'AWTSMOOS_INSTALL_ROOT' $defaultRoot
$config = Join-Path $root 'config.json'
$statePath = Join-Path $root 'install-state.txt'
$manifestStatePath = Join-Path $root 'install-manifest.sha256'
$manifestCopyPath = Join-Path $root 'installed-manifest.txt'
$manifestUrl = $origin + '/apps/tunnel/agent/manifest.txt'
New-Item -ItemType Directory -Force -Path $root | Out-Null

if (-not (Test-Path $config)) {
  $name = EnvOr 'AWTSMOOS_TUNNEL_NAME' ('awt-' + $env:USERNAME + '-' + (Get-Random -Minimum 1000 -Maximum 9999))
  $localApiPort = [int](EnvOr 'AWTSMOOS_LOCAL_API_PORT' '3977')
  $cfg = @{ BH = 'BH'; relay = (EnvOr 'AWTSMOOS_RELAY' 'wss://awtsmoos.com'); tunnelName = $name; local = (EnvOr 'AWTSMOOS_LOCAL' 'http://localhost:3000'); root = (EnvOr 'AWTSMOOS_PROJECT_ROOT' (Get-Location).Path); allowWrite = $true; allowSecrets = $false; enableLocalHttpProxy = $true; localApi = @{ enabled = $true; host = '127.0.0.1'; port = $localApiPort } } | ConvertTo-Json -Depth 8
  Write-Utf8NoBom $config $cfg
}

Write-Host 'Checking Awtsmoos manifest...'
$manifestText = Download-Text $manifestUrl
$lines = Get-ManifestLines $manifestText
if ($lines.Count -lt 2) { throw 'Manifest is missing version and entry.' }
$version = $lines[0]
$entry = $lines[1]
$files = @($lines | Select-Object -Skip 2)
$manifestHash = Get-Sha256Text (($lines -join "`n"))
if ($entry -ne 'main.js') { throw ('Bad manifest entry: ' + $entry) }
if ($files.Count -lt 1) { throw 'Manifest has no files.' }
$installedVersion = ''
$installedHash = ''
if (Test-Path $statePath) { $installedVersion = (Get-Content -Raw $statePath).Trim() }
if (Test-Path $manifestStatePath) { $installedHash = (Get-Content -Raw $manifestStatePath).Trim() }
$hasCompleteInstall = Test-AllManifestFiles $root $entry $files
if ($installedVersion -eq $version -and $installedHash -eq $manifestHash -and $hasCompleteInstall) { Write-Host ('Awtsmoos version ' + $version + ' manifest ' + $manifestHash + ' already installed and complete.') }
else {
  if ($installedVersion -eq $version) { Write-Host ('Repairing Awtsmoos version ' + $version + ' because manifest changed/incomplete...') } else { Write-Host ('Installing Awtsmoos version ' + $version + '...') }
  Install-AwtsmoosBundles $root $origin
  if (-not (Test-AllManifestFiles $root $entry $files)) { throw 'Bundle install verification failed. No file fallback is available by policy.' }
  Write-Utf8NoBom $statePath $version
  Write-Utf8NoBom $manifestStatePath $manifestHash
  Write-Utf8NoBom $manifestCopyPath ($lines -join "`n")
}
if (IsTrueEnv 'AWTSMOOS_SKIP_START') { Write-Host 'AWTSMOOS_SKIP_START set; install verified without starting agent.'; exit 0 }
$shouldRestart = (IsTrueEnv 'AWTSMOOS_RESTART') -or ($installedVersion -ne $version) -or ($installedHash -ne $manifestHash) -or (-not $hasCompleteInstall)
if ($shouldRestart) { Stop-OldAwtsAgent $root $entry }
Write-Host ''
Write-Host 'Starting Awtsmoos background agent...' -ForegroundColor Green
$argList = @((Join-Path $root $entry))
if (-not (IsTrueEnv 'AWTSMOOS_SKIP_OPEN_CONTROL')) { $argList += '--open-control' }
Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList $argList -WorkingDirectory $root
Write-Host 'Awtsmoos agent launched in background.'
