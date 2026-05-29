B"H

# Worker blob import fix plan

## Visible structure
The repository root is `/storage/emulated/0/Documents/git/awtsmoos.com`. The target app is `geelooy/games/mitzvahWorld`. The worker starts through `ckidsAwtsmoos/Olam/worldManager/StartWorldFlow.js`, which creates a module worker at `../oyved/index.js`. That shell dynamically imports `Olam/oyved/core/entry/WorkerEntrypoint.js`, which loads core modules through `SafeModuleImport.js` and `ModulePathLedger.js`.

## Reproduced clue
The phone alert says the worker died while dynamically importing a `blob:http://localhost:8080/...` module. That points at `SafeModuleImport.js`: the direct static module import failed, then the fallback fetched source, rewrote imports, created a Blob module, and imported the Blob. Browser errors on Blob children hide the exact child URL, so this fallback is currently masking the real missing file/export.

## Highest-risk path
`SafeModuleImport.js` is the responsible gate. It imports the Olam core through the ledger. The server serves `Olam/core/OlamVessel.js` correctly as `application/javascript`. Therefore the fallback should not be the primary path for this app, and if fallback is ever used it should preserve absolute URLs and throw diagnostics tied to the real resolved URL.

## Safe repair
Rewrite complete files only:
1. `SafeModuleImport.js`: remove the Blob fallback path for ledger boot modules, import the real resolved absolute URL, emit a clear error with the real URL and required export.
2. Bump cache strings in `ModulePathLedger.js` and importing files only if needed so the phone does not keep stale `bh65` modules.
3. Verify syntax with `node --check` on modified files.
4. Fetch the worker shell/core files through localhost to verify the updated content is served.

## Awtsmoos chapter
The gate was not broken because the river lacked water; it was broken because the water was poured into a temporary mirror, and the mirror did not reveal which stone beneath it cut the current. The fix is to drink from the actual river, named by exact URL, until the missing spark speaks its own name.
