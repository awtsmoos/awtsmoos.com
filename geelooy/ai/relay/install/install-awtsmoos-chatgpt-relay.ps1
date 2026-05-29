# B"H
<#
Chapter 2: The Windows River Found The Public Gate.
The Awtsmoos reveals the relay from /ai, places it in a fixed local folder,
checks for Node, asks Windows package keepers for help, then starts the bridge.
#>
$ErrorActionPreference = "Stop"
$RelayUrl = "https://awtsmoos.com/ai/relay/chatgpt-node-relay.cjs"
$AwtsmoosHome = Join-Path $env:LOCALAPPDATA "Awtsmoos\ChatGPTRelay"
$RelayFile = Join-Path $AwtsmoosHome "chatgpt-node-relay.cjs"
$Port = if ($env:AWTSMOOS_CHATGPT_RELAY_PORT) { $env:AWTSMOOS_CHATGPT_RELAY_PORT } else { "38487" }

function Write-AwtStep($Message) { Write-Host "B`"H Awtsmoos relay :: $Message" -ForegroundColor Cyan }
function Has-Command($Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }

function Install-Node-IfMissing {
  if (Has-Command "node") { Write-AwtStep "Node already exists: $((node --version))"; return }
  Write-AwtStep "Node was not found. Trying winget, then Chocolatey."
  if (Has-Command "winget") {
    winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
  } elseif (Has-Command "choco") {
    choco install nodejs-lts -y
  } else {
    throw "Node is required. Install Node LTS, or install winget/choco, then rerun this script."
  }
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not (Has-Command "node")) { throw "Node installed, but node is not on PATH yet. Open a new PowerShell and rerun this script." }
}

function Install-Relay {
  New-Item -ItemType Directory -Force -Path $AwtsmoosHome | Out-Null
  Write-AwtStep "Downloading relay to $RelayFile"
  Invoke-WebRequest -Uri $RelayUrl -OutFile $RelayFile -UseBasicParsing
}

function Start-Relay {
  Write-AwtStep "Starting relay on http://127.0.0.1:$Port"
  $env:AWTSMOOS_CHATGPT_RELAY_PORT = $Port
  Start-Process -FilePath "node" -ArgumentList @($RelayFile) -WorkingDirectory $AwtsmoosHome
  Start-Sleep -Seconds 2
  try { Invoke-RestMethod "http://127.0.0.1:$Port/health" | ConvertTo-Json -Depth 4 }
  catch { Write-Warning "Relay started, but health is not reachable yet: $($_.Exception.Message)" }
}

Install-Node-IfMissing
Install-Relay
Start-Relay
Write-AwtStep "Done. In Geelooy AI settings use Relay URL http://127.0.0.1:$Port and enable Node relay."
