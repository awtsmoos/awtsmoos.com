
# B"H
$ErrorActionPreference = "Stop"

Write-Host 'B"H Awtsmoos Tunnel Installer' -ForegroundColor Cyan

function Test-AwtsCommand($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Read-AwtsValue($label, $default) {
  if ([string]::IsNullOrWhiteSpace($default)) {
    $v = Read-Host $label
  } else {
    $v = Read-Host "$label [$default]"
  }

  if ([string]::IsNullOrWhiteSpace($v)) {
    return $default
  }

  return $v
}

function Get-CleanName($name) {
  $clean = $name.ToLower() -replace "[^a-z0-9_-]+", "-"
  $clean = $clean.Trim("-")
  if ([string]::IsNullOrWhiteSpace($clean)) {
    return "user"
  }
  return $clean
}

function Get-YesDefault($answer) {
  if ([string]::IsNullOrWhiteSpace($answer)) {
    return $true
  }

  $a = $answer.Trim().ToLower()

  return (
    $a -eq "y" -or
    $a -eq "yes" -or
    $a -eq "true" -or
    $a -eq "1"
  )
}

function Stop-OldAwtsTunnel($clientPath) {
  try {
    $escaped = [Regex]::Escape($clientPath)

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
$client = Join-Path $root "awtsmoos-tunnel-client.js"
$config = Join-Path $root "config.json"

$oldConfig = $null

if (Test-Path $config) {
  try {
    $oldText = Get-Content $config -Raw
    $oldText = $oldText.TrimStart([char]0xFEFF)
    $oldConfig = $oldText | ConvertFrom-Json
  } catch {
    $oldConfig = $null
  }
}

Stop-OldAwtsTunnel $client

if (Test-Path $root) {
  Write-Host "Cleaning old tunnel folder..."
  Remove-Item $root -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "Downloading latest tunnel client..."
Invoke-WebRequest -Uri "https://awtsmoos.com/api/tunnel/install/client" -OutFile $client

$userClean = Get-CleanName $env:USERNAME
$defaultName = "awt-" + $userClean + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
$defaultProject = (Get-Location).Path
$defaultWrite = $true

if ($oldConfig) {
  if ($oldConfig.tunnelName) {
    $defaultName = $oldConfig.tunnelName
  }

  if ($oldConfig.root) {
    $defaultProject = $oldConfig.root
  }

  if ($null -ne $oldConfig.allowWrite) {
    $defaultWrite = [bool]$oldConfig.allowWrite
  }

  Write-Host ""
  Write-Host "Previous config found and will be refreshed:" -ForegroundColor Green
  Write-Host "Tunnel name: $defaultName"
  Write-Host "Project root: $defaultProject"
  Write-Host "Writes: $defaultWrite"
  Write-Host ""
}

$tunnelName = Read-AwtsValue "Tunnel name" $defaultName
$projectRoot = Read-AwtsValue "Project folder to expose" $defaultProject

$defaultWriteText = "Y"
if (-not $defaultWrite) {
  $defaultWriteText = "N"
}

$writeAnswer = Read-Host "Allow writing files? Y/n [$defaultWriteText]"

if ([string]::IsNullOrWhiteSpace($writeAnswer)) {
  $allowWrite = $defaultWrite
} else {
  $allowWrite = Get-YesDefault $writeAnswer
}

$configObject = @{
  relay = "wss://awtsmoos.com"
  tunnelName = $tunnelName
  local = "http://localhost:3000"
  root = $projectRoot
  allowWrite = $allowWrite
}

$json = $configObject | ConvertTo-Json -Depth 5
Write-Utf8NoBom $config $json

Write-Host ""
Write-Host 'B"H tunnel config saved without BOM.' -ForegroundColor Green
Write-Host $config
Write-Host "Starting tunnel..."
Write-Host ""
Write-Host "Paste into your GPT:" -ForegroundColor Cyan
Write-Host "tunnelName: $tunnelName"
Write-Host "project path: ."
Write-Host ""

node $client
