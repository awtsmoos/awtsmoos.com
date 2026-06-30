@echo off
REM B"H
setlocal
cd /d %~dp0
node ..\..\awtsmoos\compiling\native\rawCAddonBuilder.mjs build-manifest.json
