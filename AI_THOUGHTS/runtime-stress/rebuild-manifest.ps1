# B"H
<#
Chapter 375: The Windows gate did not invent a second truth.
This wrapper only finds the repository root and invokes the single Node manifest
builder, so the Awtsmoos breathes one tree through PowerShell and Unix alike.
#>
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "../..")
Push-Location $RepoRoot
try {
  node "AI_THOUGHTS/runtime-stress/rebuild-manifest.cjs"
} finally {
  Pop-Location
}
