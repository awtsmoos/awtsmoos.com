
// B"H

/**
 * B"H
 * Windows PowerShell installer for Awtsmoos Tunnel.
 *
 * It is intentionally idempotent:
 * - same command can install
 * - same command can update the client
 * - same command can restart the tunnel
 * - existing config is reused unless the user chooses to reconfigure
 *
 * @returns {string} PowerShell script.
 */
function windowsInstaller() {
  return String.raw`# B"H
$ErrorActionPreference = "Stop"

Write-Host "B`"H Awtsmoos Tunnel Installer" -ForegroundColor Cyan

function Test-AwtsCommand($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Read-AwtsValue($label, $default) {
  if ([string]::IsNullOrWhiteSpace($default)) {
    $v = Read-Host "$label"
  } else {
    $v = Read-Host "$label [$default]"
  }

  if ([string]::IsNullOrWhiteSpace($v)) {
    return $default
  }

  return $v
}

function Stop-OldAwtsTunnel($clientPath) {
  $escaped = [Regex]::Escape($clientPath)

  try {
    $procs = Get-CimInstance Win32_Process |
      Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match "node" -and
        $_.CommandLine -match $escaped
      }

    foreach ($p in $procs) {
      Write-Host "Stopping old tunnel process PID $($p.ProcessId)..."
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
  } catch {
    Write-Host "Could not scan old tunnel processes. Continuing..."
  }
}

if (-not (Test-AwtsCommand "node")) {
  Write-Host ""
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Write-Host "Install Node.js LTS from https://nodejs.org/ then run this command again."
  Start-Process "https://nodejs.org/"
  exit 1
}

if (-not (Test-AwtsCommand "npm")) {
  Write-Host ""
  Write-Host "npm was not found. Reinstall Node.js LTS from https://nodejs.org/."
  Start-Process "https://nodejs.org/"
  exit 1
}

$root = Join-Path $env:USERPROFILE ".awtsmoos-tunnel"
$client = Join-Path $root "awtsmoos-tunnel-client.js"
$config = Join-Path $root "config.json"
$package = Join-Path $root "package.json"

New-Item -ItemType Directory -Force -Path $root | Out-Null

Stop-OldAwtsTunnel $client

Write-Host "Downloading latest tunnel client..."
Invoke-WebRequest -Uri "https://awtsmoos.com/api/tunnel/install/client" -OutFile $client

if (-not (Test-Path $package)) {
  '{"dependencies":{"ws":"latest"}}' | Set-Content -Encoding UTF8 $package
}

Push-Location $root
Write-Host "Installing/updating ws dependency..."
npm install --silent
Pop-Location

$existing = $null

if (Test-Path $config) {
  try {
    $existing = Get-Content $config -Raw | ConvertFrom-Json
  } catch {
    $existing = $null
  }
}

$defaultName = "awt-" + $env:USERNAME.ToLower() + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
$defaultProject = (Get-Location).Path

if ($existing) {
  Write-Host ""
  Write-Host "Existing Awtsmoos Tunnel config found:" -ForegroundColor Green
  Write-Host "Tunnel name: $($existing.tunnelName)"
  Write-Host "Project root: $($existing.root)"
  Write-Host "Writes: $($existing.allowWrite)"
  Write-Host ""

  $again = Read-Host "Press ENTER to reuse and start, or type R to reconfigure"

  if ($again -ne "R" -and $again -ne "r") {
    Write-Host ""
    Write-Host "Starting Awtsmoos tunnel with existing config..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Paste into your GPT:"
    Write-Host "tunnelName: $($existing.tunnelName)"
    Write-Host "project path: ."
    Write-Host ""
    node $client
    exit
  }
}

$tunnelName = Read-AwtsValue "Tunnel name" $defaultName
$projectRoot = Read-AwtsValue "Project folder to expose" $defaultProject
$writeAnswer = Read-Host "Allow writing files? Type YES to allow, anything else for read-only"

$allowWrite = $false
if ($writeAnswer -eq "YES") {
  $allowWrite = $true
}

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
`;
}

module.exports = { windowsInstaller };
