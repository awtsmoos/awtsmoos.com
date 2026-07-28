# B"H
# Boruch Hashem
# Blessed is He
<#
The Awtsmoos carries every audited Awtsmoos.com relay vessel from one manifest.
Reinstall replaces the owned process and waits on fast direct-health readiness,
never preserving an old generation merely because a stale health route answers.
#>
$ErrorActionPreference = "Stop"
$BaseUrl = "https://awtsmoos.com/ai/relay"
$InstallRoot = Join-Path $env:LOCALAPPDATA "Awtsmoos\ChatGPTRelay"
$SplitHome = Join-Path $InstallRoot "split-browser"
$ManifestFile = Join-Path $InstallRoot "runtime-files.txt"
$Port = if ($env:AWTSMOOS_SPLIT_BROWSER_PORT) { $env:AWTSMOOS_SPLIT_BROWSER_PORT } else { "38488" }
$PidFile = Join-Path $SplitHome "relay.pid"
$LogFile = Join-Path $SplitHome "relay.log"

function Write-AwtStep($Message) {
	Write-Host "B`"H Awtsmoos split relay :: $Message" -ForegroundColor Cyan
}

function Test-RelayHealth {
	try {
		Invoke-RestMethod "http://127.0.0.1:$Port/direct-health" -TimeoutSec 2 | Out-Null
		return $true
	} catch { return $false }
}

function Install-NodeIfMissing {
	if (Get-Command node -ErrorAction SilentlyContinue) { Write-AwtStep "Node already exists: $((node --version))"; return }
	if (Get-Command winget -ErrorAction SilentlyContinue) { winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements }
	elseif (Get-Command choco -ErrorAction SilentlyContinue) { choco install nodejs-lts -y }
	else { throw "Node LTS is required. Install Node, then rerun." }
	$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
	if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node is not on PATH. Open a new PowerShell and rerun." }
}

function Install-Relay {
	New-Item -ItemType Directory -Force -Path $InstallRoot, $SplitHome | Out-Null
	Invoke-WebRequest -Uri "$BaseUrl/runtime-files.txt" -OutFile $ManifestFile -UseBasicParsing
	$runtimeFiles = Get-Content $ManifestFile | Where-Object { $_ -and -not $_.StartsWith("#") }
	foreach ($file in $runtimeFiles) {
		$relative = $file.Replace("/", [IO.Path]::DirectorySeparatorChar)
		$target = Join-Path $InstallRoot $relative
		New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
		Write-AwtStep "Downloading $file"
		Invoke-WebRequest -Uri "$BaseUrl/$file" -OutFile $target -UseBasicParsing
	}
	if (-not (Test-Path (Join-Path $SplitHome "index.js"))) { throw "Relay entry was not downloaded." }
}

function Stop-ExistingRelay {
	$relayPid = if (Test-Path $PidFile) { Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1 } else { $null }
	if (-not $relayPid) {
		$connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
		$relayPid = $connection.OwningProcess
	}
	if ($relayPid) {
		Write-AwtStep "Stopping existing relay pid $relayPid"
		Stop-Process -Id $relayPid -Force -ErrorAction SilentlyContinue
		for ($index = 0; $index -lt 30; $index++) {
			if (-not (Get-Process -Id $relayPid -ErrorAction SilentlyContinue)) { break }
			Start-Sleep -Milliseconds 100
		}
	}
	if (Test-RelayHealth) { throw "Port $Port is owned by another relay process. Stop it and rerun." }
}

function Start-Relay {
	$entry = Join-Path $SplitHome "index.js"
	"" | Set-Content $LogFile
	$args = @("/c", "set AWTSMOOS_SPLIT_BROWSER_PORT=$Port&& cd /d `"$SplitHome`" && node `"$entry`" >> `"$LogFile`" 2>>&1")
	$process = Start-Process cmd.exe -ArgumentList $args -WorkingDirectory $SplitHome -WindowStyle Hidden -PassThru
	$process.Id | Set-Content $PidFile
	for ($index = 0; $index -lt 50; $index++) {
		if (Test-RelayHealth) { Write-AwtStep "Relay is ready: http://127.0.0.1:$Port/control"; return }
		Start-Sleep -Milliseconds 200
	}
	if (Test-Path $LogFile) { Get-Content $LogFile -Tail 40 }
	throw "Relay did not answer direct-health after start."
}

Install-NodeIfMissing
Install-Relay
Stop-ExistingRelay
Start-Relay
Write-AwtStep "Done. Logs: $LogFile"
