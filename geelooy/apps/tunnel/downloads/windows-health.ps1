# B"H
# Boruch Hashem
# Blessed is He

<#
B"H
The Awtsmoos distinguishes a spawned Windows process from a matching registered
connection. Awtsmoos.com stops only the exact installed entry and waits for the
connection receipt before any success or browser opening is allowed.
#>
function Stop-OldAwtsAgent {
	param([string]$Root, [string]$Entry)
	$agentPath = [Regex]::Escape((Join-Path $Root $Entry))
	Get-CimInstance Win32_Process |
		Where-Object {
			$_.CommandLine -and
			$_.CommandLine -match 'node' -and
			$_.CommandLine -match $agentPath
		} |
		ForEach-Object {
			Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
		}
}

function Get-AwtsTunnelName {
	param([string]$Root)
	$configPath = Join-Path $Root 'config.json'
	if (-not (Test-Path $configPath)) {
		return ''
	}
	try {
		return [string]((Get-Content -Raw $configPath | ConvertFrom-Json).tunnelName)
	} catch {
		return ''
	}
}

function Start-AwtsAgent {
	param([string]$Root, [string]$Entry)
	$entryPath = Join-Path $Root $Entry
	return Start-Process `
		-WindowStyle Hidden `
		-FilePath 'node' `
		-ArgumentList @($entryPath) `
		-WorkingDirectory $Root `
		-PassThru
}

function Test-AwtsProcessAlive {
	param([int]$ProcessId)
	return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Test-AwtsRegistrationReceipt {
	param(
		[string]$Root,
		[int]$ProcessId,
		[string]$TunnelName
	)
	$statusScript = Join-Path $Root 'scripts\connection-status.cjs'
	if (-not (Test-Path $statusScript)) {
		return $false
	}
	& node $statusScript check $Root $ProcessId $TunnelName 600000 *> $null
	return $LASTEXITCODE -eq 0
}

function Wait-AwtsRegistration {
	param(
		[string]$Root,
		[int]$ProcessId,
		[string]$TunnelName,
		[int]$TimeoutSeconds = 45
	)
	$started = Get-Date
	while (((Get-Date) - $started).TotalSeconds -lt $TimeoutSeconds) {
		if (-not (Test-AwtsProcessAlive $ProcessId)) {
			return $false
		}
		if (Test-AwtsRegistrationReceipt $Root $ProcessId $TunnelName) {
			return $true
		}
		$elapsed = [int]((Get-Date) - $started).TotalSeconds
		$progress = 82 + [Math]::Min(14, [Math]::Floor(($elapsed * 14) / [Math]::Max(1, $TimeoutSeconds)))
		Write-AwtsProgress $progress ('Waiting for registered tunnel ' + $TunnelName)
		Start-Sleep -Seconds 1
	}
	return $false
}
