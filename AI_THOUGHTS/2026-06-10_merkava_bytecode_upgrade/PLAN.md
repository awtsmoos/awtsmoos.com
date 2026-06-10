B"H

# Merkava Bytecode Upgrade Plan

## Project vessel inspected
- Root: /storage/emulated/0/Documents/git/awtsmoos.com
- Target page: geelooy/scripts/awtsmoos/MerkavaExecutor/index.html
- Current UI files: app/forge-core.js, app/forge-ui.js, app/styles.css
- VM bridge: app/vm.js
- Current reversible byte holder: app/codec.js
- RAM VM execution bytecode: merkava-vm/* and compiler modules

## Immediate breakages
1. The route without a trailing slash resolves relative assets incorrectly.
2. Native host callbacks can lose binding and throw Illegal invocation.
3. The source-bytecode container is only raw section bytes, not a real reversible typed opcode stream.
4. The UI does not show enough metrics, packed source bytes, runtime bytes, or BMP visualization.

## Upgrade path
1. Keep RAM bytecode as the execution world: Merkava compiler lowers JS into VM instructions.
2. Add a new reversible source-bytecode world: HTML/CSS/JS are encoded into typed records.
3. Add codecs that can encode source to bytes, decode bytes to records, and rebuild source.
4. Add BMP conversion: byte array to 24-bit BMP data URL, and BMP data URL back to bytes.
5. Upgrade index.html to use absolute local paths so both slash/no-slash routes work.
6. Upgrade vm.js to bind requestAnimationFrame, cancelAnimationFrame, timers, and key browser functions.
7. Upgrade the forge UI to show:
   - packed byte metrics
   - original vs packed byte counts
   - decoded/rebuilt HTML/CSS/JS
   - BMP preview image
   - generated BMP data size
   - VM result/RAM metrics
8. Test with simulateRuntime and syntax checks.

## Architecture
Source files -> source-bytecode records -> packed bytes -> reversible decode -> rebuilt files.
Source-bytecode records -> runtime compile -> RAM execution bytecode -> Merkava VM.
Packed bytes -> BMP pixels -> BMP bytes/data URL -> bytes -> records -> source.

## Safety
All modified files will be rewritten completely. No partial patches.
