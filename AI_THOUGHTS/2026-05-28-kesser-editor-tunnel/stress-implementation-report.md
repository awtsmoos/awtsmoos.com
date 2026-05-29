B"H

# Stress Implementation Report

Implemented real source-level tunnel action stress coverage instead of only planning.

Files rewritten:
- `geelooy/apps/tunnel/agent/tools/fs/hashWrite.js`
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/readActions.js`
- `geelooy/apps/tunnel/agent/tools/fs/selectString.js`
- `geelooy/apps/tunnel/agent/tools/fs/testing/all-actions-source-stress.test.cjs`

Existing earlier rewrites still included:
- `geelooy/apps/tunnel/agent/tools/command/index.js`
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindow.js`

Bugs found and fixed:
1. `hashWrite.js` leaked `content` without declaration in `writeIfHash`.
2. `readActions.js` `md()` returned raw file content because spread order overwrote fenced Markdown content.
3. `selectString.js` did not search `.txt` files by default and did not return a `count` alias, making it inconsistent with related search actions.
4. The new all-action source stress harness initially caught missing `fsTree` in its fixture config.

New test:
- `geelooy/apps/tunnel/agent/tools/fs/testing/all-actions-source-stress.test.cjs`

What it verifies:
- Builds the real `buildActions()` action map from source.
- Confirms a broad surface of 385 registered actions exists and each registered entry is callable.
- Confirms key actions exist: `bulk`, `read`, `read64`, `astOutline`, `simulateRuntime`, `commandTreeRun`, `toolStressMatrix`, `writeIfHash`.
- Confirms command aliases exist in source: `command`, `commandRun`, `runCommand`, `shell`, `nodeScript`, `nodeScriptRun`.
- Exercises read family: `list`, `tree`, `read`, `readBytes`, `read64`, `md`, `readLines`, `readManyLines`, `bulk`.
- Exercises search/AST family: `grep`, `rg`, `find`, `findFiles`, `selectString`, `selectStringFile`, `fileHashes`, `astOutline`, `symbolOutline`, `connectedFiles`.
- Exercises write/hash/patch family: `write`, `bulkWrite`, `writeIfHash`, `bulkWriteIfHashes`, `replaceRange`, `applyPatch`.
- Exercises workflow/runtime/command family: `commandTreeRun`, `commandTreeDryRun`, `simulateRuntime`, and command alias execution through `handleCommand({ action: "command" })`.

Verification command passed:
`node geelooy/apps/tunnel/agent/tools/fs/testing/action-registry-stress.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/source-runtime-bulk-commandtree.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/runtime-actions-real.test.cjs && node geelooy/apps/tunnel/agent/tools/fs/testing/all-actions-source-stress.test.cjs`

Result:
- action-registry-stress: ok, 4 tests.
- source-runtime-bulk-commandtree: ok.
- runtime-actions-real: ok, 4 tests.
- all-actions-source-stress: ok, 385 registered actions, 5 families.

Honest limitation:
The harness does not destructively execute every dangerous action such as delete/process kill/port kill/server stop against the real repo. Instead, it proves the full source action map is registered and directly executes representative safe actions across every major family in a disposable fixture. The live tunnel still needs an agent restart to load source changes such as command aliases.
