# B"H
# Boruch Hashem
# Blessed is He

<#
The Awtsmoos keeps durable identity and project root outside release replacement.
Awtsmoos.com creates configuration once and derives one verified manifest context.
#>
function Initialize-AwtsConfig {
	param([string]$Root)
	$configPath = Join-Path $Root 'config.json'
	if (Test-Path $configPath) { return }
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
		localApi = @{ enabled = $true; host = '127.0.0.1'; port = $localApiPort }
	} | ConvertTo-Json -Depth 8
	Write-Utf8NoBom $configPath $config
}

function Get-AwtsManifestContext {
	param([string]$Origin)
	$manifestText = Download-AwtsText ($Origin.TrimEnd('/') + '/apps/tunnel/agent/manifest.txt')
	$lines = Get-ManifestLines $manifestText
	if ($lines.Count -lt 3) { throw 'Manifest is missing version, entry, or files.' }
	$context = @{
		Version = [string]$lines[0]
		Entry = [string]$lines[1]
		Files = @($lines | Select-Object -Skip 2)
		Hash = Get-Sha256Text (($lines -join "`n"))
		Text = ($lines -join "`n")
	}
	if ($context.Entry -ne 'main.js') { throw 'Manifest entry is invalid.' }
	foreach ($filePath in $context.Files) {
		if (-not (Test-SafeRelativePath $filePath)) { throw ('Unsafe manifest path: ' + $filePath) }
	}
	return $context
}

function Get-AwtsInstalledManifestFiles {
	param([string]$Root)
	$path = Join-Path $Root 'installed-manifest.txt'
	if (-not (Test-Path $path)) { return @() }
	try {
		$lines = Get-ManifestLines (Get-Content -Raw $path)
		return @($lines | Select-Object -Skip 2)
	} catch { return @() }
}
