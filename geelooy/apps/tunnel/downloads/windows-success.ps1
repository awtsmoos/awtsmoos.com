# B"H
# Boruch Hashem
# Blessed is He

<#
B"H
The Awtsmoos opens Tunnel Control only after the matching Windows receipt is alive.
Awtsmoos.com prints every next step even when the default browser cannot be opened.
#>
function Get-AwtsControlUrl {
	param([string]$Origin)
	$explicit = Get-AwtsEnv 'AWTSMOOS_CONTROL_URL' ''
	if (-not [string]::IsNullOrWhiteSpace($explicit)) {
		return $explicit
	}
	return $Origin.TrimEnd('/') + '/apps/tunnel-control/'
}

function Open-AwtsControl {
	param([string]$ControlUrl)
	if (Test-AwtsTrueEnv 'AWTSMOOS_SKIP_OPEN_CONTROL') {
		Write-Host ('Tunnel Control auto-open skipped: ' + $ControlUrl)
		return $false
	}
	try {
		Start-Process $ControlUrl | Out-Null
		Write-Host ('Opened Tunnel Control: ' + $ControlUrl) -ForegroundColor Cyan
		return $true
	} catch {
		Write-Host ('Could not open a browser automatically. Open: ' + $ControlUrl) -ForegroundColor Yellow
		return $false
	}
}

function Show-AwtsInstallSuccess {
	param(
		[string]$Version,
		[string]$TunnelName,
		[string]$ProjectRoot,
		[string]$ControlUrl
	)
	Write-Host ''
	Write-Host '============================================================' -ForegroundColor Cyan
	Write-Host 'B"H  AWTSMOOS TUNNEL INSTALLED AND CONNECTED' -ForegroundColor Green
	Write-Host '============================================================' -ForegroundColor Cyan
	Write-Host ('Tunnel name : ' + $TunnelName)
	Write-Host ('Project root: ' + $ProjectRoot)
	Write-Host ('Version     : ' + $Version)
	Write-Host ('Control     : ' + $ControlUrl)
	Write-Host ''
	Write-Host 'The background agent is running. Keep it available while ChatGPT works.'
	Write-Host 'Refresh or repair at any time with:'
	Write-Host 'irm https://awtsmoos.com/api/tunnel/install/windows | iex' -ForegroundColor Cyan
	Write-Host '============================================================' -ForegroundColor Cyan
}

function Show-AwtsSkipStart {
	param(
		[string]$Version,
		[string]$TunnelName,
		[string]$ProjectRoot
	)
	Write-Host ''
	Write-Host 'B"H Awtsmoos Tunnel files verified; runtime start was skipped.' -ForegroundColor Yellow
	Write-Host ('Tunnel name : ' + $TunnelName)
	Write-Host ('Project root: ' + $ProjectRoot)
	Write-Host ('Version     : ' + $Version)
}
