B"H

# Verified Results

## Fixed
- `geelooy/apps/tunnel/agent/tools/fs/isolatedJs.js`
  - Fixed default tunnel payload `p: "."` being treated as a runnable entry path.
  - Added `safeEntryName(payload)` so `.` / `./` / `\.` become `test.js`.
- `geelooy/apps/tunnel/agent/manifest.json`
  - Updated `tools/fs/isolatedJs.js` bytes and SHA-256 after the source patch.

## Verified live/source behavior
- `bulk` direct action: ok, returned two files, truncation metadata worked.
- `rg` direct action: ok, found `bulkSearch` registrations.
- `rgbgrep` direct action: ok, found `read64` implementation.
- `read64` direct action: ok, returned base64 content and byte pagination metadata.
- Patched source isolated JS test: ok, exit 0, stdout `isolated-ok`, stderr empty.
- `nodeCheckMany`: 8 files checked, 0 failed.
- Manifest JSON parse: ok, isolatedJs.js entry has bytes 4605 and sha256 d6f59ec6797acd441a2dbc68f0c8b1b78a8fae904c8a131219d2877d83b24432.

## Honest remaining note
The currently running live agent is still using the installed `.awtsmoos-tunnel` copy until the agent is refreshed/restarted. The repo source and install manifest are fixed.
