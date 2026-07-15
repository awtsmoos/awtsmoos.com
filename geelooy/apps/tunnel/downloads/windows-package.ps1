# B"H
# Boruch Hashem
# Blessed is He

<#
B"H
The Awtsmoos joins manifest bytes, safe paths, and exact hashes into one verified
Windows package covenant. Awtsmoos.com keeps these pure primitives apart from ZIP
transport so each vessel remains small, testable, and reusable.
#>
function Get-AwtsEnv {
	param([string]$Name, [string]$Fallback = '')
	$value = [Environment]::GetEnvironmentVariable($Name)
	if ([string]::IsNullOrWhiteSpace($value)) {
		return $Fallback
	}
	return $value
}

function Test-AwtsTrueEnv {
	param([string]$Name)
	$value = (Get-AwtsEnv $Name '').ToLowerInvariant()
	return @('1', 'true', 'yes', 'on') -contains $value
}

function Write-Utf8NoBom {
	param([string]$Path, [string]$Text)
	$encoding = New-Object System.Text.UTF8Encoding($false)
	[System.IO.File]::WriteAllText($Path, $Text, $encoding)
}

function Download-AwtsText {
	param([string]$Url)
	$client = New-Object System.Net.WebClient
	$client.Encoding = [System.Text.Encoding]::UTF8
	try {
		return $client.DownloadString($Url).TrimStart([char]0xFEFF)
	} finally {
		$client.Dispose()
	}
}

function Get-Sha256Text {
	param([string]$Text)
	$sha = [System.Security.Cryptography.SHA256]::Create()
	try {
		$bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
		return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
	} finally {
		$sha.Dispose()
	}
}

function Get-ManifestLines {
	param([string]$Text)
	return @(
		[regex]::Split($Text, '\r?\n') |
			ForEach-Object { $_.Trim().TrimStart([char]0xFEFF) } |
			Where-Object { $_ -and $_ -ne 'B"H' -and $_ -ne '# B"H' }
	)
}

function Test-SafeRelativePath {
	param([string]$FilePath)
	if ([string]::IsNullOrWhiteSpace($FilePath)) {
		return $false
	}
	return -not (
		$FilePath.StartsWith('/') -or
		$FilePath.StartsWith('\') -or
		$FilePath.Contains('..') -or
		$FilePath -match '\s'
	)
}

function Test-AllManifestFiles {
	param([string]$Root, [string]$Entry, [array]$Files)
	if (-not (Test-Path (Join-Path $Root $Entry))) {
		return $false
	}
	foreach ($filePath in $Files) {
		if (-not (Test-SafeRelativePath $filePath)) {
			throw ('Unsafe manifest path: ' + $filePath)
		}
		if (-not (Test-Path (Join-Path $Root $filePath))) {
			return $false
		}
	}
	return $true
}

function Test-ZipSignature {
	param([string]$Path)
	if (-not (Test-Path $Path)) {
		return $false
	}
	$stream = [System.IO.File]::OpenRead($Path)
	try {
		if ($stream.Length -lt 4) {
			return $false
		}
		$bytes = New-Object byte[] 4
		[void]$stream.Read($bytes, 0, 4)
		return $bytes[0] -eq 0x50 -and $bytes[1] -eq 0x4b -and $bytes[2] -eq 0x03 -and $bytes[3] -eq 0x04
	} finally {
		$stream.Dispose()
	}
}
