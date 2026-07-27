# B"H
# Boruch Hashem
# Blessed is He

<#
The Awtsmoos stages a complete release before touching the living runtime.
Awtsmoos.com captures every overwritten manifest path and restores it on failure.
#>
function New-AwtsTransaction {
	param([string]$Root)
	$id = [Guid]::NewGuid().ToString('N')
	$base = Join-Path $Root ('.activations\' + $id)
	$transaction = @{
		Id = $id
		Base = $base
		Stage = Join-Path $base 'stage'
		Rollback = Join-Path $base 'rollback'
		Journal = Join-Path $base 'journal.json'
	}
	New-Item -ItemType Directory -Force -Path $transaction.Stage, $transaction.Rollback | Out-Null
	Write-AwtsJournal $transaction 'created' @()
	return $transaction
}

function Save-AwtsRollback {
	param([hashtable]$Transaction, [string]$Root, [array]$Paths)
	$captured = @()
	foreach ($relative in (Select-AwtsUniquePaths $Paths)) {
		$source = Join-Path $Root $relative
		if (-not (Test-Path $source)) { continue }
		$target = Join-Path $Transaction.Rollback $relative
		New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
		Copy-Item -Recurse -Force -Path $source -Destination $target
		$captured += $relative
	}
	foreach ($stateFile in @('install-state.txt', 'install-manifest.sha256', 'installed-manifest.txt')) {
		$source = Join-Path $Root $stateFile
		if (-not (Test-Path $source)) { continue }
		Copy-Item -Force $source (Join-Path $Transaction.Rollback $stateFile)
		$captured += $stateFile
	}
	Write-AwtsJournal $Transaction 'rollback_captured' $captured
	return $captured
}

function Install-AwtsStage {
	param([hashtable]$Transaction, [string]$Origin, [hashtable]$Manifest)
	Install-AwtsmoosBundles $Transaction.Stage $Origin
	if (-not (Test-AllManifestFiles $Transaction.Stage $Manifest.Entry $Manifest.Files)) {
		throw 'Staged bundle verification failed.'
	}
	Write-AwtsJournal $Transaction 'stage_verified' $Manifest.Files
}

function Activate-AwtsStage {
	param([hashtable]$Transaction, [string]$Root, [hashtable]$Manifest)
	foreach ($relative in @($Manifest.Entry) + $Manifest.Files) {
		$source = Join-Path $Transaction.Stage $relative
		$target = Join-Path $Root $relative
		New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
		Copy-Item -Recurse -Force -Path $source -Destination $target
	}
	Write-Utf8NoBom (Join-Path $Root 'install-state.txt') $Manifest.Version
	Write-Utf8NoBom (Join-Path $Root 'install-manifest.sha256') $Manifest.Hash
	Write-Utf8NoBom (Join-Path $Root 'installed-manifest.txt') $Manifest.Text
	Write-AwtsJournal $Transaction 'activated' $Manifest.Files
}

function Restore-AwtsRollback {
	param([hashtable]$Transaction, [string]$Root, [array]$ActivatedPaths)
	foreach ($relative in (Select-AwtsUniquePaths $ActivatedPaths)) {
		Remove-Item -Recurse -Force (Join-Path $Root $relative) -ErrorAction SilentlyContinue
	}
	if (Test-Path $Transaction.Rollback) {
		Get-ChildItem -Force $Transaction.Rollback | ForEach-Object {
			Copy-Item -Recurse -Force $_.FullName (Join-Path $Root $_.Name)
		}
	}
	Write-AwtsJournal $Transaction 'rolled_back' $ActivatedPaths
}

function Complete-AwtsTransaction {
	param([hashtable]$Transaction)
	Write-AwtsJournal $Transaction 'committed' @()
	Remove-Item -Recurse -Force $Transaction.Base -ErrorAction SilentlyContinue
}

function Write-AwtsJournal {
	param([hashtable]$Transaction, [string]$State, [array]$Paths)
	@{ activationId = $Transaction.Id; state = $State; paths = @($Paths); at = (Get-Date).ToUniversalTime().ToString('o') } |
		ConvertTo-Json -Depth 6 |
		ForEach-Object { Write-Utf8NoBom $Transaction.Journal $_ }
}

function Select-AwtsUniquePaths {
	param([array]$Paths)
	return @($Paths | Where-Object { $_ -and (Test-SafeRelativePath $_) } | Sort-Object -Unique)
}
