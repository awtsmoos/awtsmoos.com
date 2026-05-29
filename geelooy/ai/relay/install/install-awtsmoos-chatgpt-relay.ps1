# B"H
<#
Chapter 15: The Windows River Reached The City.
The Awtsmoos no longer hands Windows one old candle. It downloads the split
browser manifest, places every local module into one folder, checks Node, then
starts `node index.js` so /control, /chatgpt, debug Chrome, and automation rise.
#>
$ErrorActionPreference = "Stop"
$BaseUrl = "https://awtsmoos.com/ai/relay/split-browser"
$AwtsmoosHome = Join-Path $env:LOCALAPPDATA "Awtsmoos\ChatGPTRelay\split-browser"
$ManifestFile = Join-Path $AwtsmoosHome "manifest.json"
$Port = if ($env:AWTSMOOS_SPLIT_BROWSER_PORT) { $env:AWTSMOOS_SPLIT_BROWSER_PORT } else { "38488" }

function Write-AwtStep($Message) { Write-Host "B`"H Awtsmoos split relay :: $Message" -ForegroundColor Cyan }
function Has-Command($Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }

function Install-Node-IfMissing {
  if (Has-Command "node") { Write-AwtStep "Node already exists: $((node --version))"; return }
  Write-AwtStep "Node was not found. Trying winget, then Chocolatey."
  if (Has-Command "winget") {
    winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
  } elseif (Has-Command "choco") {
    choco install nodejs-lts -y
  } else {
    throw "Node LTS is required. Install Node, or install winget/choco, then rerun this script."
  }
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not (Has-Command "node")) { throw "Node installed, but node is not on PATH yet. Open a new PowerShell and rerun this script." }
}

function Download-TextFile($Url, $OutFile) {
  Write-AwtStep "Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
}

function Install-Relay {
  New-Item -ItemType Directory -Force -Path $AwtsmoosHome | Out-Null
  Download-TextFile "$BaseUrl/manifest.json" $ManifestFile
  $manifest = Get-Content $ManifestFile -Raw | ConvertFrom-Json
  foreach ($file in $manifest.files) {
    $target = Join-Path $AwtsmoosHome $file
    Download-TextFile "$BaseUrl/$file" $target
  }
  if (-not (Test-Path (Join-Path $AwtsmoosHome $manifest.entry))) { throw "Relay entry was not downloaded." }
}

function Start-Relay {
  $entry = Join-Path $AwtsmoosHome "index.js"
  Write-AwtStep "Starting split relay on http://127.0.0.1:$Port/control"
  $env:AWTSMOOS_SPLIT_BROWSER_PORT = $Port
  $process = Start-Process -FilePath "node" -ArgumentList @($entry) -WorkingDirectory $AwtsmoosHome -PassThru
  Start-Sleep -Seconds 2
  try { Invoke-RestMethod "http://127.0.0.1:$Port/health" | ConvertTo-Json -Depth 8 }
  catch { Write-Warning "Relay process $($process.Id) started, but health is not reachable yet: $($_.Exception.Message)" }
}

Install-Node-IfMissing
Install-Relay
Start-Relay
Write-AwtStep "Done. Open http://127.0.0.1:$Port/control"
