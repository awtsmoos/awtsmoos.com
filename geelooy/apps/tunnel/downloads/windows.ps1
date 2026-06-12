$BH="BH"
$ErrorActionPreference = 'Stop'
Write-Host 'Awtsmoos Tunnel Bootstrap' -ForegroundColor Cyan

function EnvOr($name, $fallback) { $v = [Environment]::GetEnvironmentVariable($name); if ([string]::IsNullOrWhiteSpace($v)) { return $fallback }; return $v }
function IsTrueEnv($name) { $v = (EnvOr $name ''); return @('1','true','yes','on') -contains $v.ToLowerInvariant() }
function Write-Utf8NoBom($path, $text) { $encoding = New-Object System.Text.UTF8Encoding($false); [System.IO.File]::WriteAllText($path, $text, $encoding) }
function Download-Text($url) { $wc = New-Object System.Net.WebClient; $wc.Encoding = [System.Text.Encoding]::UTF8; try { return $wc.DownloadString($url).TrimStart([char]0xFEFF) } finally { $wc.Dispose() } }
function Stop-OldAwtsAgent($root, $entry) {
  $agentPath = [Regex]::Escape((Join-Path $root $entry))
  Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'node' -and $_.CommandLine -match $agentPath } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
function Get-ManifestLines($text) {
  return @([regex]::Split($text, '\r?\n') | ForEach-Object { $_.Trim().TrimStart([char]0xFEFF) } | Where-Object { $_ -ne '' -and $_ -ne 'B"H' -and $_ -ne '# B"H' })
}
function Test-SafeRelativePath($filePath) {
  if ([string]::IsNullOrWhiteSpace($filePath)) { return $false }
  if ($filePath.StartsWith('/') -or $filePath.StartsWith('\') -or $filePath.Contains('..') -or $filePath -match '\s') { return $false }
  return $true
}
function Test-AllManifestFiles($root, $entry, $files) {
  if (-not (Test-Path (Join-Path $root $entry))) { return $false }
  foreach ($filePath in $files) { if (-not (Test-Path (Join-Path $root $filePath))) { return $false } }
  return $true
}
function File-Url($origin, $baseUrl, $filePath) {
  if ($filePath.StartsWith('ai/')) { return $origin.TrimEnd('/') + '/' + $filePath }
  return $baseUrl.TrimEnd('/') + '/' + $filePath
}
function Install-AwtsmoosFiles($root, $origin, $baseUrl, $files) {
  $client = New-Object System.Net.WebClient
  try {
    $total = $files.Count
    $index = 0
    foreach ($filePath in $files) {
      $index++
      if (-not (Test-SafeRelativePath $filePath)) { throw ('Unsafe manifest path: ' + $filePath) }
      $dest = Join-Path $root $filePath
      $parent = Split-Path $dest -Parent
      New-Item -ItemType Directory -Force -Path $parent | Out-Null
      if (($index % 25) -eq 1 -or $index -eq $total) { Write-Host ('Downloading file fallback ' + $index + '/' + $total + ': ' + $filePath) }
      $client.DownloadFile((File-Url $origin $baseUrl $filePath), $dest)
    }
  } finally {
    $client.Dispose()
  }
}
function Install-AwtsmoosBundles($root, $origin, $manifestUrl) {
  try {
    $bundleManifestUrl = $manifestUrl + '?bundle=manifest'
    Write-Host 'Trying Awtsmoos ZIP bundle install...'
    $bundleManifest = (Download-Text $bundleManifestUrl) | ConvertFrom-Json
    if (-not $bundleManifest.bundles -or $bundleManifest.bundles.Count -lt 1) { throw 'No bundles returned.' }
    $tmp = Join-Path $root '.bundle-downloads'
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    $client = New-Object System.Net.WebClient
    try {
      foreach ($bundle in $bundleManifest.bundles) {
        $zipPath = Join-Path $tmp ($bundle.name + '.zip')
        $url = $origin.TrimEnd('/') + $bundle.url
        Write-Host ('Downloading bundle ' + $bundle.name + '...')
        $client.DownloadFile($url, $zipPath)
        Write-Host ('Expanding bundle ' + $bundle.name + '...')
        Expand-Archive -Force -Path $zipPath -DestinationPath $root
      }
    } finally {
      $client.Dispose()
    }
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    return $true
  } catch {
    Write-Host ('Bundle install failed; falling back to per-file install: ' + $_.Exception.Message) -ForegroundColor Yellow
    return $false
  }
}

$origin = (EnvOr 'AWTSMOOS_INSTALL_ORIGIN' 'https://awtsmoos.com').TrimEnd('/')
$defaultRoot = Join-Path $env:USERPROFILE '.awtsmoos-tunnel'
$root = EnvOr 'AWTSMOOS_INSTALL_ROOT' $defaultRoot
$config = Join-Path $root 'config.json'
$statePath = Join-Path $root 'install-state.txt'
$manifestUrl = $origin + '/apps/tunnel/agent/manifest.txt'
$baseUrl = $origin + '/apps/tunnel/agent'
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
  $bundleOk = Install-AwtsmoosBundles $root $origin $manifestUrl
  if (-not $bundleOk -or -not (Test-AllManifestFiles $root $entry $files)) {
    Install-AwtsmoosFiles $root $origin $baseUrl $files
  }
  if (-not (Test-AllManifestFiles $root $entry $files)) { throw 'Install verification failed after bundle/per-file install.' }
  Write-Utf8NoBom $statePath $version
}
if (IsTrueEnv 'AWTSMOOS_SKIP_START') { Write-Host 'AWTSMOOS_SKIP_START set; install verified without starting agent.'; exit 0 }
Stop-OldAwtsAgent $root $entry
Write-Host ''
Write-Host 'Starting Awtsmoos background agent...' -ForegroundColor Green
if (IsTrueEnv 'AWTSMOOS_SKIP_OPEN_CONTROL') { & node (Join-Path $root $entry) } else { & node (Join-Path $root $entry) --open-control }
