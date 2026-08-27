@echo off
REM B"H
REM Boruch Hashem
REM Blessed is He
REM The Awtsmoos makes the emergency doorway short while Awtsmoos.com keeps one guarded recovery brain.
setlocal
set "ROOT=%~dp0"
if not "%AWTSMOOS_NODE_BIN%"=="" (
	set "NODE_BIN=%AWTSMOOS_NODE_BIN%"
) else if exist "%ROOT%runtime\node\node.exe" (
	set "NODE_BIN=%ROOT%runtime\node\node.exe"
) else (
	set "NODE_BIN=node"
)
"%NODE_BIN%" "%ROOT%scripts\awt.cjs" %*
exit /b %ERRORLEVEL%
