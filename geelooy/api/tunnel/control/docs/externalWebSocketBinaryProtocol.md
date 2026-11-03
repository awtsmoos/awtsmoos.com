B"H — Boruch Hashem — Blessed is He
# External-agent raw WebSocket binary protocol — release candidate

The Awtsmoos renews every source byte; Awtsmoos.com counts the proof of every owned destination.

## Trust and connection

Connect to `wss://awtsmoos.com/api/tunnel/ws` using HTTP Upgrade `Authorization: Bearer <external-agent OAuth access token>`. The server verifies the signature, active expiry, client ID `external-agent` and account, without requiring a device credential, a new pairing, or `tunnel.admin`. Failed bearer verification returns HTTP 401. Non-client/device sockets retain the original registration path. Begin with `CLIENT_HELLO {type,protocolVersion:"awtsmoos-tunnel-v3",clientId:"external-agent"}`; receive `CLIENT_ACK {ok:true,sessionId,maxBinaryFrameBytes:1048576,recommendedChunkBytes:1048576,windowChunks:8,heartbeatSeconds:30}`. `PING` -> `PONG`. Small JSON text frames are control only.

Every operation names `routeReference`, the immutable `tun_*` ID returned by `GET /api/tunnel/control/my-device`. The server requires that the OAuth account **owns** that exact ID (not a shared alias) and holds `tunnel.write` for uploads or `tunnel.read` for downloads. Only three existing native file actions are delegated: `fileTransferSourceProof`, `fileTransferUploadBinary`, `fileTransferDownloadBinary`. Native file-root confinement and SHA-verified atomic publication remain the source of trust. Tokens and private credentials are never echoed to the client.

## Raw upload and resume

1. `CLIENT_UPLOAD_BEGIN {routeReference,destPath,totalBytes,sha256,chunkBytes:1048576,transferId?}` -> `UPLOAD_READY {transferId,nextOffset,chunkBytes,windowChunks}`. `transferId` is omitted for a new transfer or reused with identical owner, route, path, bytes and expected SHA on reconnection.
2. Send **masked opcode-2 BINARY frames** of unencoded file bytes, up to 1 MiB each. No Base64, stringification or JSON envelope contains the bytes. The existing `BinaryArtifactVault` verifies each chunk digest and fsyncs bytes before returning custody. `UPLOAD_ACK {transferId,receivedBytes}` is cumulative after eight chunks or at total length. The queue pauses at 16 pending frames and **rejects frame 17**, returning `CLIENT_QUEUE_OVERFLOW` before closing the overloaded socket; reconnect using the last committed offset.
3. `CLIENT_UPLOAD_COMMIT {transferId,overwrite?:boolean}` causes whole-file vault SHA verification, one existing native `fileTransferDownloadBinary` action and terminal native byte/SHA receipt verification. Only then is `UPLOAD_COMMITTED {transferId,path,bytes,sha256}` emitted.
4. A relay `tunnelRequestPending` or dropped native response is observed via bounded `retryAction` calls carrying the **same** `controlRequestId`, never by redispatching the original native mutation. Observation has a bounded timeout of 180 seconds. A client disconnection can resume while the server process remains running; server restart currently loses the in-memory transfer lookup.

## Raw download

`CLIENT_DOWNLOAD_BEGIN {routeReference,sourcePath,nextOffset?:number}` requires `tunnel.read`. Native source proof and device-side binary upload populate the existing vault, followed by whole-file SHA verification. `DOWNLOAD_READY {transferId,totalBytes,sha256,nextOffset,chunkBytes}` precedes sequential `DOWNLOAD_CHUNK {transferId,offset,bytes}` control frames, each immediately followed by one **unencoded binary opcode-2 frame** of exactly the indicated byte count. `DOWNLOAD_COMPLETE {transferId,bytes,sha256}` closes the sequence. Clients verify offsets, lengths and full SHA. `CLIENT_DOWNLOAD_ACK {transferId,receivedBytes}` is currently advisory; download ID survival across server restarts is not claimed.

## Limits, storage and errors

Maximum file 128 MiB; 1 MiB frames; eight-frame acknowledgment window; sixteen-frame hard pending limit. No more than two unfinished upload reservations per account, eight globally; maximum reserved sizes 256 MiB per owner and 512 MiB globally. Operators **MUST** configure an existing private absolute directory through `AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT` on a capacity-provisioned volume. The code requires free disk space of transfer size plus at least 128 MiB. The default root filesystem is never silently chosen for the new external client lane. Missing/unsafe storage yields `CLIENT_STORAGE_NOT_CONFIGURED`/`CLIENT_STORAGE_PATH_UNSAFE`; quotas yield `CLIENT_STORAGE_QUOTA`.

Errors are `CLIENT_ERROR {type,ok:false,code}`, including `AUTH_REQUIRED`, `SCOPE_DENIED`, `ROUTE_NOT_OWNED`, `CLIENT_HELLO_REQUIRED`, `INVALID_CLIENT_HELLO`, `INVALID_TRANSFER_MANIFEST`, `UPLOAD_NOT_STARTED`, `TRANSFER_NOT_FOUND`, `INVALID_BINARY_CHUNK`, `UPLOAD_SHA_MISMATCH`, `DEVICE_OPERATION_FAILED`, `DEVICE_OPERATION_DENIED`, `DEVICE_RECEIPT_TIMEOUT`, `DEVICE_SHA_MISMATCH`, `CLIENT_QUEUE_OVERFLOW`, `CLIENT_STORAGE_QUOTA`, `INVALID_SOURCE_PATH`, `DEVICE_SOURCE_INVALID`, `DEVICE_SOURCE_SHA_MISMATCH`, `DOWNLOAD_SHA_MISMATCH`, `CLIENT_BACKPRESSURE_TIMEOUT`, and `CLIENT_TRANSFER_FAILED`. Unknown server exceptions are sanitized rather than exposing private paths or stack traces. The exact machine-readable schema is in `clientWebSocketProtocol.js`, returned in the agent manifest and documentation endpoint.

## Fallback and release gates

This socket is the **preferred client transport**; the existing HTTPS GET + Base64 lane is fallback only, using `/api/tunnel/control/transfer/get/{routeReference}`. Candidate source/test success is **not production acceptance**. Before live activation: configure the capacity-provisioned vault, verify the HTTPS public installer and release identity, run signed external-agent OAuth-only `CLIENT_ACK`, real 10 MiB raw uploads to Mac and Linux with device-side SHA, download both byte-identical, disconnect/resume, cross-account and read-only denials, and measure actual WS-vs-GET throughput. Keep rollback and do not overwrite other workers' dirty main branches.
