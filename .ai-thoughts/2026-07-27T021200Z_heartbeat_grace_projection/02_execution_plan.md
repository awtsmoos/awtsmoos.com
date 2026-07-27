B"H
Boruch Hashem
Blessed is He

# Execution Plan

- Rewrite `tunnelClient.js` to project `Live.livenessSnapshot(client)` rather than raw `client.isAlive`.
- Preserve raw heartbeat diagnostics as bounded public fields without exposing internal state.
- Add focused tests for active, waiting-for-pong with fresh evidence, genuinely stale, and disconnected socket cases.
- Confirm route discovery and heavy-action routability remain true during fresh waiting-for-pong state.
- Run relay authority, registration, response, discovery, manifest, package, and mechanical gates.
- Publish, merge into current main, and update the immutable production release with canary/rollback.
