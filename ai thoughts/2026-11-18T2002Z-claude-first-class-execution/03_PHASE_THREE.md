B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Exact File Plan

The Awtsmoos gives each deed a vessel clear,
Awtsmoos.com makes command, file, and browser tools explicit so no guessed name need appear.

## Create

- `mcp/directActionTools.js`
	Stable handlers mapping MCP tool names to protected native actions.
- `mcp/directActionCatalog.js`
	Schemas and truthful annotations for command, command-status/output, file write/delete, and browser action.
- `mcp/toolInvocation.js`
	Extract tool handler routing and MCP result formatting from oversized `protocol.js`.
- Focused tests for direct command/write/browser mapping, tool annotations, and protocol dispatch.

## Rewrite completely

- `mcp/toolCatalog.js`
	Include direct-action catalog while preserving existing read/discovery/artifact tools.
- `mcp/protocol.js`
	Reduce below 120 lines by delegating tools/call to `toolInvocation.js`; preserve discovery, initialize, ping, version negotiation, and resource-link behavior through the extracted invoker.
- `mcp/diagnostics.js`
	Stop presenting projection absence as definitive native command absence; report capability testimony separately from execution proof.
- `mcp/deviceTools.js` only if a stable public boolean is needed for doctor truth; do not leak the internal manifest.

## Direct tool contracts

### `awtsmoos_run_command`
Inputs: routeReference optional, command required, cwd optional, timeoutMs optional, maxChars optional. Internally uses `commandRun`.

### `awtsmoos_command_status`
Inputs: routeReference optional, jobId required. Internally uses `commandJobStatus`.

### `awtsmoos_command_output`
Inputs: routeReference optional, jobId required, stream stdout/stderr, offsetChars/maxChars optional. Internally uses `commandJobOutputPage`.

### `awtsmoos_write_file`
Inputs: routeReference optional, path required, content required, optional hash/confirm fields only if the existing action supports them. Internally uses full-file `write`.

### `awtsmoos_delete_file`
Inputs: routeReference optional, path required, confirm required. Internally uses `deleteFile`.

### `awtsmoos_browser_action`
Inputs: routeReference optional, operation required from a bounded allowlist, params object. Allowed operations include chromeStatus, chromeNavigate, chromeSnapshot, chromeFind, chromeClick, chromeType, chromeWaitForSelector, chromeEvalSlim, chromeScreenshot, and chromeLogs.

## Verification

- Unit-test exact internal action mappings.
- Prove generic action remains available and destructive.
- Prove direct command tool appears in `tools/list` with required `command` schema.
- Prove protocol dispatch calls command tool without raw action guessing.
- Prove write and browser tools enforce existing scope/native gates through GenericTools.
- Run full OAuth/MCP regression, syntax, <=120-line, tab indentation, and `git diff --check`.
- Re-read every touched file and exact diff.
- Commit/push/deploy exact SHA.
- Publicly inspect `tools/list` through an authenticated test bearer if available; otherwise verify production source SHA plus public MCP discovery and a server-side direct handler integration test against the live native route.
