# B"H

# Static proof lifecycle repair

The proof completes capture, persistence, assertions, and JSON output, then hangs
inside the `finally` cleanup. `ReferenceProofChromeSession.stop()` closes the owned
tab first; `StaticFileServer.stop()` then waits on `server.close()` while Chromium
retains HTTP keep-alive connections. The evidence contract already completed, but
the process cannot terminate.

## Complete file approved for rewrite

- `tools/render/headless/StaticFileServer.js`

The repair stops accepting requests, closes idle connections, closes remaining
owned local proof connections when the runtime supports it, and retains the same
server API and evidence behavior for every proof and WebCodecs consumer.
