# B"H
<#
Chapter 18: The Windows River Dropped The Unused Bridge.
The relay installer carries only modules the running split-browser server needs.
It downloads public .js/.cjs sparks, places them locally, then starts the actual
control relay with `node index.js`.
#>
$ErrorActionPreference = "Stop"
$BaseUrl = "https://awtsmoos.com/ai/relay/split-browser"
$AwtsmoosHome = Join-Path $env:LOCALAPPDATA "Awtsmoos\ChatGPTRelay\split-browser"
$Port = if ($env:AWTSMOOS_SPLIT_BROWSER_PORT) { $env:AWTSMOOS_SPLIT_BROWSER_PORT } else { "38488" }
$RelayFiles = @(
  "authState.cjs", "autoLogin.cjs", "automation.cjs", "bodyPolicy.cjs",
  "bodyTransform.cjs", "browserRewrite.cjs", "browserShim.cjs",
  "cdpChrome.cjs", "clientDiagnostics.cjs", "clientState.cjs",
  "config.cjs", "controlPage.cjs", "cookieJar.cjs", "debugApi.cjs",
  "debugClient.cjs", "headerMap.cjs", "http.cjs", "index.js",
  "jsPreamble.cjs", "logger.cjs", "originPolicy.cjs", "proxy.cjs",
  "relayApi.cjs", "rewriteHtml.cjs", "rewriteText.cjs",
  "routeNormalize.cjs", "server.cjs", "urlMap.cjs"
)

function Write-AwtStep($Message) { Write-Host "B`"H Awtsmoos split relay :: $Message" -ForegroundColor Cyan }
function Has-Command($Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }

function Install-Node-IfMissing {
  if (Has-Command "node") { Write-AwtStep "Node already exists: $((node --version))"; return }
  Write-AwtStep "Node was not found. Trying winget, then Chocolatey."
  if (Has-Command "winget") { winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements }
  elseif (Has-Command "choco") { choco install nodejs-lts -y }
  else { throw "Node LTS is required. Install Node, or install winget/choco, then rerun this script." }
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not (Has-Command "node")) { throw "Node installed, but node is not on PATH yet. Open a new PowerShell and rerun this script." }
}

function Download-TextFile($File) {
  $target = Join-Path $AwtsmoosHome $File
  Write-AwtStep "Downloading $File"
  Invoke-WebRequest -Uri "$BaseUrl/$File" -OutFile $target -UseBasicParsing
}

function Install-Relay {
  New-Item -ItemType Directory -Force -Path $AwtsmoosHome | Out-Null
  foreach ($file in $RelayFiles) { Download-TextFile $file }
  if (-not (Test-Path (Join-Path $AwtsmoosHome "index.js"))) { throw "Relay entry was not downloaded." }
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
