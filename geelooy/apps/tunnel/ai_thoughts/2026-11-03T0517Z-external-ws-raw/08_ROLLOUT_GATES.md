B"H — Boruch Hashem — Blessed is He
# Final verification: planned versus written and rollout gates
The Awtsmoos makes honest unfinished work visible; Awtsmoos.com cannot claim a live pipe from a simulated light.

## Three design passes review
Phase I selected distinct signed external OAuth socket, existing raw vault and unchanged device credentials. Actual: new OAuth upgrade identity, own JSON and raw opcode-2 dispatch with exact owner/route/scopes, no device register; 1MiB native vault and bounded ACK window. Phase II required valid path confinement, raw bytes, error codes, SHA and no upload commit without native proof. Actual: SHA checks, existing native protected fs actions only, 128MiB max and explicit failures; full device response **mocked** in unit test. Phase III asked 10MiB two-device live tests, network throughput, OAuth-only real WSS, docs and release. Actual: two mock-native 10MiB transfer suites, OAuth signed offline fixture, real frame codec, comprehensive docs, but **live Mac/Linux and comparative throughput NOT completed**.

Extra three receipt plans repaired canonical control: `nativeReceipt.js` sends original `files` once; observes `tunnelRequestPending` and initial `RemoteDisconnected` through original IDs with bounded `retryAction`, no blind mutation replay. Red-green overflow test proved 17 queued raw frames before rewrite; now fails closed at hard 16. Storage safety discovered default vault root on nearly full Linux `/`, changed to required `AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT`, minimum free 128MiB extra, per-owner/global active quota; tested on mounted data volume. Old Python `remote_linux.py` file is not accessible from the discovered Mac/Linux workspace, so system-wide `commandWait` HTTP disconnections remain unresolved by this isolated bridge. No agent reinstall, parent restart, or production deletion occurred.

## Preproduction safety contract
1. Review exact source diff, new JS <120 lines, syntax and all nine suites green; 2. commit isolated branch; 3. push branch only non-force after verifying remote; 4. ensure collaborator origin/main moves are integrated conflict-free before any merge; 5. configure storage on a private filesystem with free space; 6. independent OAuth-only WS handshake against live server; 7. proper native Mac/Linux 10MiB byte/SHA receipts, including mid-upload interruption and restart; 8. benchmark actual GET/Base64 vs WS wall-clock throughput; 9. no token echo, per-owner denial; 10. code-review/rollback gate before service restart; 11. verify running commit and live ticket; 12. keep previous native clients healthy. Without these, stage as candidate only.

## Known engineering gaps
- Server-process restart loses in-memory transfer mapping; vault journal survives but no resurrection API yet
- Download reconnect repopulates device->vault; no persisted streaming download session across server restarts
- No live measurement of throughput or p95 on Mac/Linux
- Native `commandWait` caller/proxy disconnect symptoms may require HTTP gateway timeout and durable polling changes outside this client bridge
- Root disk (~96 MiB free) is unsuitable for default 128MiB artifacts; data volume has ~3.8GiB and also requires lifecycle expiry, monitoring and capacity planning
- Existing main may advance independently; never force-push or erase dirty files

The Awtsmoos creates every byte at each instant. We report tested behavior as tested; we do not replace real-world proof with a paragraph.
