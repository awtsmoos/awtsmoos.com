# B"H
# Boruch Hashem
# Blessed is He

$ErrorActionPreference = 'Stop'

. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-progress.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-package.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-bundle.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-health.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-config.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-transaction.ps1')
. (Join-Path $env:AWTSMOOS_INSTALL_RUNTIME 'windows-success.ps1')

<#
The Awtsmoos stages, verifies, captures, activates, proves, and only then commits.
Awtsmoos.com restores the prior release and identity if the new agent cannot register.
#>
function Invoke-AwtsInstallCore {
	$origin = (Get-AwtsEnv 'AWTSMOOS_INSTALL_ORIGIN' 'https://awtsmoos.com').TrimEnd('/')
	$root = Get-AwtsEnv 'AWTSMOOS_INSTALL_ROOT' (Join-Path $env:USERPROFILE '.awtsmoos-tunnel')
	New-Item -ItemType Directory -Force -Path $root | Out-Null
	Write-AwtsProgress 20 'Preserving durable identity and configuration'
	Initialize-AwtsConfig $root
	Write-AwtsProgress 28 'Downloading and validating release manifest'
	$manifest = Get-AwtsManifestContext $origin
	$config = Get-Content -Raw (Join-Path $root 'config.json') | ConvertFrom-Json
	$transaction = New-AwtsTransaction $root
	$oldFiles = Get-AwtsInstalledManifestFiles $root
	$rollbackPaths = @($oldFiles) + @($manifest.Entry) + @($manifest.Files)
	$priorEntry = if (Test-Path (Join-Path $root 'main.js')) { 'main.js' } else { '' }
	try {
		Write-AwtsProgress 38 'Downloading complete release into verified stage'
		Install-AwtsStage $transaction $origin $manifest
		Write-AwtsProgress 56 'Capturing manifest-scoped rollback release'
		[void](Save-AwtsRollback $transaction $root $rollbackPaths)
		Write-AwtsProgress 68 'Stopping previous exact runtime'
		Stop-OldAwtsAgent $root $manifest.Entry
		Write-AwtsProgress 74 'Activating staged release'
		Activate-AwtsStage $transaction $root $manifest
		if (Test-AwtsTrueEnv 'AWTSMOOS_SKIP_START') {
			Complete-AwtsTransaction $transaction
			Write-Progress -Activity 'Installing Awtsmoos Tunnel' -Completed
			Show-AwtsSkipStart $manifest.Version ([string]$config.tunnelName) ([string]$config.root)
			return
		}
		Write-AwtsProgress 82 'Starting candidate release'
		$process = Start-AwtsAgent $root $manifest.Entry
		if (-not (Wait-AwtsRegistration $root $process.Id ([string]$config.tunnelName) 45)) {
			throw ('Candidate agent did not register. PID=' + $process.Id)
		}
		Complete-AwtsTransaction $transaction
		Complete-AwtsProgress
		$controlUrl = Get-AwtsControlUrl $origin
		Show-AwtsInstallSuccess $manifest.Version ([string]$config.tunnelName) ([string]$config.root) $controlUrl
		[void](Open-AwtsControl $controlUrl)
	} catch {
		Write-AwtsProgress 90 'Candidate failed; restoring previous release'
		Stop-OldAwtsAgent $root $manifest.Entry
		Restore-AwtsRollback $transaction $root $rollbackPaths
		if ($priorEntry -and (Test-Path (Join-Path $root $priorEntry))) {
			[void](Start-AwtsAgent $root $priorEntry)
		}
		throw
	}
}

try { Invoke-AwtsInstallCore }
catch { Fail-AwtsProgress $_.Exception.Message; throw }
