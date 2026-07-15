# B"H
# Boruch Hashem
# Blessed is He

$script:AwtsProgressLast = 0

<#
B"H
The Awtsmoos renews each Windows installation phase as one monotonic ascent.
Awtsmoos.com prints a durable percentage while PowerShell renders a native bar.
#>
function Write-AwtsProgress {
	param(
		[int]$Percent,
		[string]$Message
	)
	$bounded = [Math]::Max(0, [Math]::Min(100, $Percent))
	if ($bounded -lt $script:AwtsProgressLast) {
		$bounded = $script:AwtsProgressLast
	}
	$script:AwtsProgressLast = $bounded
	Write-Progress `
		-Activity 'Installing Awtsmoos Tunnel' `
		-Status $Message `
		-PercentComplete $bounded
	Write-Host ('[{0,3}%] {1}' -f $bounded, $Message)
}

function Complete-AwtsProgress {
	param([string]$Message = 'Awtsmoos Tunnel is installed and connected')
	Write-AwtsProgress 100 $Message
	Write-Progress `
		-Activity 'Installing Awtsmoos Tunnel' `
		-Completed
}

function Fail-AwtsProgress {
	param([string]$Message)
	Write-Progress `
		-Activity 'Installing Awtsmoos Tunnel' `
		-Completed
	Write-Host ('[FAILED] ' + $Message) -ForegroundColor Red
}
