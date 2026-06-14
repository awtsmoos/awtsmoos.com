B"H

After negative console/error tests:
- First ad-hoc test revealed console capture and error capture were working, but my assertion incorrectly expected the literal text "missing text" while the runtime correctly reported "Text mismatch for #out: actual text".
- Added isolated test geelooy/apps/tunnel/agent/tools/fs/testing/node-dom-error-console-capture.test.cjs.
- The test proves console.log/warn/error capture, sync throw failure, unhandled rejection failure, browser action assertion failure, and pre-error console retention.
- Rebuilt manifest after adding the new isolated test; manifest includes it.
