# B"H
# Boruch Hashem
# Blessed is He

$ErrorActionPreference = 'Stop'

. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-progress.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-package.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-bundle.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-health.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-success.ps1')

<#
B"H
The Windows core reserves one hundred percent for a matching connection receipt.
The Awtsmoos renews manifest, bundle, process, and tunnel name together;
Awtsmoos.com opens Control only after the registered doorway is proved alive.
#>
function Initialize-AwtsConfig {
	param([string]$Root)
	$configPath = Join-Path $Root 'config.json'
	if (Test-Path $configPath) {
		return
	}
	$name = Get-AwtsEnv 'AWTSMOOS_TUNNEL_NAME' ('awt-' + $env:USERNAME + '-' + (Get-Random -Minimum 1000 -Maximum 9999))
	$localApiPort = [int](Get-AwtsEnv 'AWTSMOOS_LOCAL_API_PORT' '3977')
	$config = @{
		BH = 'BH'
		relay = Get-AwtsEnv 'AWTSMOOS_RELAY' 'wss://awtsmoos.com'
		tunnelName = $name
		local = Get-AwtsEnv 'AWTSMOOS_LOCAL' 'http://localhost:3000'
		root = Get-AwtsEnv 'AWTSMOOS_PROJECT_ROOT' (Get-Location).Path
		allowWrite = $true
		allowSecrets = $false
		enableLocalHttpProxy = $true
		localApi = @{
			enabled = $true
			host = '127.0.0.1'
			port = $localApiPort
		}
	} | ConvertTo-Json -Depth 8
	Write-Utf8NoBom $configPath $config
}

function Invoke-AwtsInstallCore {
	$origin = (Get-AwtsEnv 'AWTSMOOS_INSTALL_ORIGIN' 'https://awtsmoos.com').TrimEnd('/')
	$defaultRoot = Join-Path $env:USERPROFILE '.awtsmoos-tunnel'
	$root = Get-AwtsEnv 'AWTSMOOS_INSTALL_ROOT' $defaultRoot
	$statePath = Join-Path $root 'install-state.txt'
	$manifestStatePath = Join-Path $root 'install-manifest.sha256'
	$manifestCopyPath = Join-Path $root 'installed-manifest.txt'
	$manifestUrl = $origin + '/apps/tunnel/agent/manifest.txt'
	New-Item -ItemType Directory -Force -Path $root | Out-Null

	Write-AwtsProgress 20 'Preparing configuration'
	Initialize-AwtsConfig $root
	Write-AwtsProgress 26 'Downloading release manifest'
	$manifestText = Download-AwtsText $manifestUrl
	$lines = Get-ManifestLines $manifestText
	if ($lines.Count -lt 2) {
		throw 'Manifest is missing version and entry.'
	}
	$version = $lines[0]
	$entry = $lines[1]
	$files = @($lines | Select-Object -Skip 2)
	$manifestHash = Get-Sha256Text (($lines -join "`n"))
	if ($entry -ne 'main.js' -or $files.Count -lt 1) {
		throw 'Manifest entry or file inventory is invalid.'
	}

	$installedVersion = if (Test-Path $statePath) { (Get-Content -Raw $statePath).Trim() } else { '' }
	$installedHash = if (Test-Path $manifestStatePath) { (Get-Content -Raw $manifestStatePath).Trim() } else { '' }
	$complete = Test-AllManifestFiles $root $entry $files
	Write-AwtsProgress 34 'Manifest verified'
	if ($installedVersion -ne $version -or $installedHash -ne $manifestHash -or -not $complete) {
		Install-AwtsmoosBundles $root $origin
		Write-AwtsProgress 58 'Verifying installed bundle'
		if (-not (Test-AllManifestFiles $root $entry $files)) {
			throw 'Bundle install verification failed.'
		}
		Write-Utf8NoBom $statePath $version
		Write-Utf8NoBom $manifestStatePath $manifestHash
		Write-Utf8NoBom $manifestCopyPath ($lines -join "`n")
	}
	Write-AwtsProgress 68 'Release files are complete'

	$config = Get-Content -Raw (Join-Path $root 'config.json') | ConvertFrom-Json
	if (Test-AwtsTrueEnv 'AWTSMOOS_SKIP_START') {
		Write-AwtsProgress 72 'Files verified; runtime start skipped'
		Write-Progress -Activity 'Installing Awtsmoos Tunnel' -Completed
		Write-Host 'AWTSMOOS_SKIP_START set; install verified without starting agent.'
		Show-AwtsSkipStart $version ([string]$config.tunnelName) ([string]$config.root)
		return
	}

	Write-AwtsProgress 74 'Stopping the previous exact runtime'
	Stop-OldAwtsAgent $root $entry
	Write-AwtsProgress 80 'Starting Awtsmoos background agent'
	$process = Start-AwtsAgent $root $entry
	if (-not (Wait-AwtsRegistration $root $process.Id ([string]$config.tunnelName) 45)) {
		throw ('Agent did not register before the deadline. PID=' + $process.Id)
	}
	Complete-AwtsProgress
	$controlUrl = Get-AwtsControlUrl $origin
	Show-AwtsInstallSuccess $version ([string]$config.tunnelName) ([string]$config.root) $controlUrl
	[void](Open-AwtsControl $controlUrl)
}

try {
	Invoke-AwtsInstallCore
} catch {
	Fail-AwtsProgress $_.Exception.Message
	throw
}
