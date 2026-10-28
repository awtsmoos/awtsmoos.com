# B"H
# Boruch Hashem
# Blessed is He

$ErrorActionPreference = 'Stop'
$origin = [Environment]::GetEnvironmentVariable('AWTSMOOS_INSTALL_ORIGIN')
if ([string]::IsNullOrWhiteSpace($origin)) { $origin = 'https://awtsmoos.com' }
$origin = $origin.TrimEnd('/')
$root = [Environment]::GetEnvironmentVariable('AWTSMOOS_INSTALL_ROOT')
if ([string]::IsNullOrWhiteSpace($root)) { $root = Join-Path $env:USERPROFILE '.awtsmoos-tunnel' }
$runtime = Join-Path ([System.IO.Path]::GetTempPath()) ('awtsmoos-installer-' + [Guid]::NewGuid().ToString('N'))
$integrityCatalogBase64 = '__AWTSMOOS_BOOTSTRAP_INTEGRITY_BASE64__'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

<#
The Awtsmoos gives each downloaded vessel a measured border and a faithful name;
Awtsmoos.com verifies bytes before PowerShell may turn remote text into living flame.
#>
function Write-BootstrapProgress {
	param([int]$Percent, [string]$Message)
	Write-Progress -Activity 'Preparing Awtsmoos Tunnel installer' -Status $Message -PercentComplete $Percent
	Write-Host ('[{0,3}%] {1}' -f $Percent, $Message)
}

function Read-IntegrityCatalog {
	if ($integrityCatalogBase64.StartsWith('__AWTSMOOS_')) {
		throw 'Bootstrap integrity catalog was not injected.'
	}
	try {
		$json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($integrityCatalogBase64))
		$catalog = $json | ConvertFrom-Json
	} catch {
		throw ('Bootstrap integrity catalog is invalid: ' + $_.Exception.Message)
	}
	if ($catalog.schemaVersion -ne 1 -or $null -eq $catalog.files) {
		throw 'Bootstrap integrity catalog schema is unsupported.'
	}
	return $catalog
}

function Get-IntegrityEntry {
	param([object]$Catalog, [string]$Name)
	$property = $Catalog.files.PSObject.Properties[$Name]
	if ($null -eq $property -or $null -eq $property.Value) {
		throw ('Missing integrity witness for ' + $Name)
	}
	return $property.Value
}

function Assert-InstallerHelper {
	param([string]$Path, [object]$Expected, [string]$Name)
	$actualBytes = (Get-Item -LiteralPath $Path).Length
	if ([long]$actualBytes -ne [long]$Expected.bytes) {
		throw ('Installer helper length mismatch for ' + $Name)
	}
	$actualSha = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
	if ($actualSha -ne ([string]$Expected.sha256).ToLowerInvariant()) {
		throw ('Installer helper SHA-256 mismatch for ' + $Name)
	}
}

function Download-VerifiedInstallerHelper {
	param([object]$Catalog, [string]$Name)
	$expected = Get-IntegrityEntry -Catalog $Catalog -Name $Name
	$destination = Join-Path $runtime $Name
	$partial = $destination + '.partial'
	$client = New-Object System.Net.WebClient
	try {
		$client.DownloadFile($origin + '/apps/tunnel/downloads/' + $Name, $partial)
		Assert-InstallerHelper -Path $partial -Expected $expected -Name $Name
		Move-Item -Force -LiteralPath $partial -Destination $destination
	} finally {
		$client.Dispose()
		Remove-Item -Force -LiteralPath $partial -ErrorAction SilentlyContinue
	}
}

$helpers = @(
	'windows-progress.ps1', 'windows-package.ps1', 'windows-bundle.ps1',
	'windows-health.ps1', 'windows-config.ps1', 'windows-transaction.ps1',
	'windows-success.ps1', 'windows-core.ps1'
)

try {
	Write-BootstrapProgress 0 'Preparing installer workspace'
	if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js was not found in PATH.' }
	$integrityCatalog = Read-IntegrityCatalog
	Write-BootstrapProgress 4 'Prerequisites and integrity catalog verified'
	for ($index = 0; $index -lt $helpers.Count; $index += 1) {
		$percent = 4 + [Math]::Floor((($index + 1) * 14) / $helpers.Count)
		Write-BootstrapProgress $percent ('Verifying installer component ' + ($index + 1) + '/' + $helpers.Count)
		Download-VerifiedInstallerHelper -Catalog $integrityCatalog -Name $helpers[$index]
	}
	$env:AWTSMOOS_INSTALL_ORIGIN = $origin
	$env:AWTSMOOS_INSTALL_ROOT = $root
	$env:AWTSMOOS_INSTALL_RUNTIME = $runtime
	Write-BootstrapProgress 18 'Verified transactional installer components ready'
	& (Join-Path $runtime 'windows-core.ps1')
} catch {
	Write-Progress -Activity 'Preparing Awtsmoos Tunnel installer' -Completed
	Write-Host ('[FAILED] ' + $_.Exception.Message) -ForegroundColor Red
	throw
} finally {
	Remove-Item -Recurse -Force $runtime -ErrorAction SilentlyContinue
}
