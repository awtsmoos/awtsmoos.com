<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Awtsmoos live stability witness

Baseline runtime 1.0.642 ran for 15.49 minutes beginning 2026-10-05T20:07:22.013Z. 6144 real HTTP requests completed with 0 HTTP failures. One instruction round explicitly returned local-only instructions during a real server websocket close (1012) at 20:12:52 UTC; reconnect recovered without manual intervention. This is recorded as a failed server-availability assertion, not hidden as success.

| Action | Requests | p50 ms | p95 ms |
|---|---:|---:|---:|
| /healthz | 4276 | 4 | 21 |
| instructionResolve | 215 | 139 | 509 |
| write | 636 | 638 | 1005 |
| fileTransferCreate | 15 | 308 | 1742 |
| commandStart | 59 | 57 | 375 |
| read | 636 | 12 | 34 |
| commandStatus | 128 | 10 | 36 |
| fileTransferWriteChunk | 75 | 139 | 419 |
| commandJobOutputPage | 45 | 8 | 20 |
| fileTransferCommit | 30 | 132 | 365 |
| fileTransferReadChunk | 15 | 94 | 398 |
| commandCancel | 14 | 163 | 429 |

59 owned command jobs completed, including 14 cancellations. 15 1 MiB transfers passed whole-file SHA-256, out-of-order chunks, duplicate chunks, commit replay, and download hash verification. 636 text mutations matched exact readback.

A separate live negative test rejected transfer_chunk_hash_mismatch, accepted the corrected chunk, and committed the expected hash. Its first fixture attempt used a too-small chunk size and was rejected before transfer creation; the corrected valid fixture then passed.

62 focused regression tests passed across API schemas/errors/authentication, readiness, bounded read-only retry, durable mutation timing, connection fencing/replay, transfer recovery, cancellation truth, and scheduler fairness. Two older test expectations were updated to match current generation deduplication and registration dial-backoff behavior, retaining independent action acceptance proof.

Scope: actual Mac localhost actions and authenticated device-to-server instruction bridge. ChatGPT user OAuth MCP-to-server-to-Mac execution was not invoked by this session. A fifteen-minute soak cannot establish indefinite reliability or a memory-leak-free overnight run.

Latency percentiles use at most the first 4,000 samples per group; /healthz had 4,276 requests. Counts include every request, not double-counted operation rounds. Mean text write latency was 697 ms; durability has not been stripped to produce a speed claim.

The new readiness response also passed a real HTTP handler test against the living 1.0.642 connection receipt before installation.

## Deployed release witness

Canonical server deployment completed at source cd1c26efd. The official transactional installer verified and promoted runtime 1.0.643, preserved tunnel identity tun_RC99m5Wz75O789hZ0pIsay5p, and confirmed launchd supervision plus independent recovery lanes. A registered receipt names both live parent and connection processes.

The installed /readyz returned HTTP 200 with relayReady:true and runtimeVersion:1.0.643. A four-action schema batch succeeded. Twelve actual command jobs, in three batches of four, returned exact independent stdout in 328–436 ms. Eight concurrent instructionResolve calls all returned serverAvailable:true. A timed durable write passed exact readback: prepare 282 ms, execute 39 ms, provenance 488 ms, total 809 ms. This supports investigating provenance overhead, not removing durability blindly.

A real public MCP initialize request without credentials returned HTTP 401. This proves the authentication boundary responds; it is not an authenticated ChatGPT action invocation. The production journal search after deployment found no matching undefined-payload parse witness or invalid HTTP status-code errors.

The 15-minute soak was against baseline 1.0.642; the new 1.0.643 received the separate post-installation checks described above, not a second 15-minute soak. The read-only retry is regression-tested, but the interrupted baseline lookup happened before that retry was installed.
