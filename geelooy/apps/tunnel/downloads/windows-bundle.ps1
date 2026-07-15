# B"H
# Boruch Hashem
# Blessed is He

<#
B"H
The Awtsmoos renews bundle metadata, ZIP bytes, signature, and extraction together.
Awtsmoos.com reveals download progress while preserving one verified bundle-only
policy and never falling back to an unsafe per-file installation.
#>
function Install-AwtsmoosBundles {
	param([string]$Root, [string]$Origin)
	$manifestUrl = $Origin.TrimEnd('/') + '/api/tunnel/install/bundle-manifest'
	$bundleManifest = (Download-AwtsText $manifestUrl) | ConvertFrom-Json
	if (-not $bundleManifest.bundles -or $bundleManifest.bundles.Count -lt 1) {
		throw 'No bundles returned. Bundle install is required.'
	}
	$tempRoot = Join-Path $Root '.bundle-downloads'
	New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
	$client = New-Object System.Net.WebClient
	try {
		$index = 0
		foreach ($bundle in $bundleManifest.bundles) {
			$index += 1
			$progress = 40 + [Math]::Min(12, $index * 6)
			Write-AwtsProgress $progress ('Downloading bundle ' + $bundle.name)
			$zipPath = Join-Path $tempRoot ($bundle.name + '.zip')
			$url = if ([string]$bundle.url -match '^https?://') {
				[string]$bundle.url
			} else {
				$Origin.TrimEnd('/') + $bundle.url
			}
			$client.DownloadFile($url, $zipPath)
			if (-not (Test-ZipSignature $zipPath)) {
				throw ('Downloaded bundle is not a ZIP archive: ' + $url)
			}
			Write-AwtsProgress ($progress + 2) ('Expanding bundle ' + $bundle.name)
			Expand-Archive -Force -Path $zipPath -DestinationPath $Root
		}
	} finally {
		$client.Dispose()
		Remove-Item -Recurse -Force $tempRoot -ErrorAction SilentlyContinue
	}
}
