# B"H
<#
Chapter 382: The Windows Installer Kept The Relay Alive.
The relay installer carries every public split-browser module, including future
browser bridge helpers. It downloads files, starts node detached with logs, waits
for /health, and points the user to the no-debug-Chrome /control login.
#>
$ErrorActionPreference = "Stop"
$BaseUrl = "https://awtsmoos.com/ai/relay/split-browser"
$AwtsmoosHome = Join-Path $env:LOCALAPPDATA "Awtsmoos\ChatGPTRelay\split-browser"
$Port = if ($env:AWTSMOOS_SPLIT_BROWSER_PORT) { $env:AWTSMOOS_SPLIT_BROWSER_PORT } else { "38488" }
$PidFile = Join-Path $AwtsmoosHome "relay.pid"
$LogFile = Join-Path $AwtsmoosHome "relay.log"
$RelayFiles = @(
  "authState.cjs", "autoLogin.cjs", "automation.cjs", "bodyPolicy.cjs",
  "bodyTransform.cjs", "browserBridge.cjs", "browserRewrite.cjs",
  "browserShim.cjs", "cdpChrome.cjs", "clientDiagnostics.cjs",
  "clientState.cjs", "config.cjs", "controlPage.cjs", "cookieJar.cjs",
  "debugApi.cjs", "debugClient.cjs", "headerMap.cjs", "http.cjs",
  "index.js", "jsPreamble.cjs", "logger.cjs", "originPolicy.cjs",
  "proxy.cjs", "relayApi.cjs", "rewriteHtml.cjs", "rewriteText.cjs",
  "routeNormalize.cjs", "server.cjs", "urlMap.cjs"
)

function Write-AwtStep($Message) { Write-Host "B`"H Awtsmoos split relay :: $Message" -ForegroundColor Cyan }
function Has-Command($Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }
function Test-RelayHealth {
  try { Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 2 | Out-Null; return $true }
  catch { return $false }
}
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
function Stop-StaleRelay {
  if (Test-RelayHealth) { Write-AwtStep "Relay already answers on http://127.0.0.1:$Port/control"; return $true }
  if (Test-Path $PidFile) {
    $oldPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($oldPid) {
      $old = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
      if ($old) { Write-AwtStep "Stopping stale relay pid $oldPid"; Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 1 }
    }
  }
  return $false
}
function Start-Relay {
  if (Stop-StaleRelay) { return }
  $entry = Join-Path $AwtsmoosHome "index.js"
  Write-AwtStep "Starting split relay on http://127.0.0.1:$Port/control"
  "" | Set-Content $LogFile
  $args = @("/c", "set AWTSMOOS_SPLIT_BROWSER_PORT=$Port&& cd /d `"$AwtsmoosHome`" && node index.js >> `"$LogFile`" 2>>&1")
  $process = Start-Process -FilePath "cmd.exe" -ArgumentList $args -WorkingDirectory $AwtsmoosHome -WindowStyle Hidden -PassThru
  $process.Id | Set-Content $PidFile
  for ($i = 0; $i -lt 25; $i++) {
    if (Test-RelayHealth) {
      Write-AwtStep "Relay is alive: http://127.0.0.1:$Port/control"
      Write-AwtStep "Open ChatGPT through Node there. This login does not require debug Chrome."
      Write-AwtStep "Logs: $LogFile"
      return
    }
    Start-Sleep -Seconds 1
  }
  Write-Warning "Relay process $($process.Id) did not answer health. Logs: $LogFile"
  if (Test-Path $LogFile) { Get-Content $LogFile -Tail 40 }
  throw "Relay did not answer /health after start."
}

Install-Node-IfMissing
Install-Relay
Start-Relay
Write-AwtStep "Done. Open http://127.0.0.1:$Port/control"
