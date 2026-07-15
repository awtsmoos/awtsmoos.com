# B"H
# Boruch Hashem
# Blessed is He

$ErrorActionPreference = 'Stop'

$origin = [Environment]::GetEnvironmentVariable('AWTSMOOS_INSTALL_ORIGIN')
if ([string]::IsNullOrWhiteSpace($origin)) {
	$origin = 'https://awtsmoos.com'
}
$origin = $origin.TrimEnd('/')
$root = [Environment]::GetEnvironmentVariable('AWTSMOOS_INSTALL_ROOT')
if ([string]::IsNullOrWhiteSpace($root)) {
	$root = Join-Path $env:USERPROFILE '.awtsmoos-tunnel'
}
$runtime = Join-Path ([System.IO.Path]::GetTempPath()) ('awtsmoos-installer-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

<#
B"H
The Windows bootstrap reveals every downloaded installer vessel before the core
exists. The Awtsmoos renews helper and percentage together; Awtsmoos.com never
leaves a remote PowerShell command looking frozen or mysteriously complete.
#>
function Write-BootstrapProgress {
	param([int]$Percent, [string]$Message)
	Write-Progress `
		-Activity 'Preparing Awtsmoos Tunnel installer' `
		-Status $Message `
		-PercentComplete $Percent
	Write-Host ('[{0,3}%] {1}' -f $Percent, $Message)
}

function Download-InstallerHelper {
	param([string]$Name)
	$url = $origin + '/apps/tunnel/downloads/' + $Name
	$destination = Join-Path $runtime $Name
	$client = New-Object System.Net.WebClient
	try {
		$client.DownloadFile($url, $destination)
	} finally {
		$client.Dispose()
	}
}

$helpers = @(
	'windows-progress.ps1',
	'windows-package.ps1',
	'windows-bundle.ps1',
	'windows-health.ps1',
	'windows-success.ps1',
	'windows-core.ps1'
)

try {
	Write-BootstrapProgress 0 'Preparing installer workspace'
	if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
		throw 'Node.js was not found in PATH.'
	}
	Write-BootstrapProgress 4 'Prerequisites verified'
	for ($index = 0; $index -lt $helpers.Count; $index += 1) {
		$percent = 4 + [Math]::Floor((($index + 1) * 14) / $helpers.Count)
		Write-BootstrapProgress $percent ('Downloading installer components (' + ($index + 1) + '/' + $helpers.Count + ')')
		Download-InstallerHelper $helpers[$index]
	}
	$env:AWTSMOOS_INSTALL_ORIGIN = $origin
	$env:AWTSMOOS_INSTALL_ROOT = $root
	$env:AWTSMOOS_INSTALL_RUNTIME = $runtime
	Write-BootstrapProgress 18 'Installer components ready'
	& (Join-Path $runtime 'windows-core.ps1')
} catch {
	Write-Progress -Activity 'Preparing Awtsmoos Tunnel installer' -Completed
	Write-Host ('[FAILED] ' + $_.Exception.Message) -ForegroundColor Red
	throw
} finally {
	Remove-Item -Recurse -Force $runtime -ErrorAction SilentlyContinue
}
