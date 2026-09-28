B"H

# Awtsmoos Tunnel Control

Awtsmoos Tunnel Control connects external AI clients to owned devices through explicit OAuth scopes, immutable route references, compact capability discovery, and resumable transfer receipts.

## Protocol law

The canonical external-agent protocol uses **HTTPS GET for OAuth and control**. Never switch it to POST.

For file data, **WebSocket is preferred but not required**. Agents without WebSocket support can transfer entire files through resumable HTTPS GET fragments. Both transports share the same `transferId` and destination manifest, so transport can change mid-transfer.

## Recommended authorization flow

1. Generate a PKCE verifier and S256 challenge.
2. GET `/api/oauth/agent-handoff?action=start&code_challenge=...&code_challenge_method=S256`.
3. Keep the returned private handoff proof, verifier, authorization URL, and status URL.
4. Open the authorization URL for the human. The callback deposits the result into the matching handoff.
5. Poll the returned status URL at the advertised cadence. When automatic delivery succeeds, do not ask the human to copy code/state.
6. GET `/api/oauth/token` with the one-time authorization code and original verifier.
7. Acknowledge the handoff, store credentials securely, then GET `/api/tunnel/control/my-device` and use its selected `routeReference`.

Manual callback copy exists only when no waiting automatic handoff can be matched.

## Headless authorization

GET `/api/oauth/device-authorization?client_id=external-agent`, show the verification URL to the human, then poll the GET token endpoint with the standard device-code grant. Honor the returned interval, `slow_down`, expiry, denial, and terminal errors.

## Huge files and videos

The durable transfer operations are:

- `fileTransferSourceInfo`
- `fileTransferSourceProof`
- `fileTransferReadChunk`
- `fileTransferCreate`
- `fileTransferStatus`
- `fileTransferWriteChunk`
- `fileTransferCommit`
- `fileTransferCancel`

WebSocket transfer uses 1 MiB chunks by default and supports up to 2 MiB per chunk.

### GET-only fallback

Agents without WebSockets use:

`GET /api/tunnel/control/transfer/get/<routeReference>`

Supported `action` values are `source-info`, `source-proof`, `read`, `create`, `status`, `write`, `commit`, and `cancel`.

GET upload fragments carry at most **4096 decoded bytes** in `content64`. GET reads default to **65536 bytes**. Every write fragment carries SHA-256, final commit verifies the whole-file SHA-256, and the destination is atomically published only after complete coverage and hash verification.

A transfer can begin through GET, continue through WebSocket, then return to GET without restarting because all roads use the same transfer ID and manifest.

After uncertain mutation delivery, query `status` and resume from `nextOffset` instead of blindly replaying a chunk.

### Device-to-device

GET `/api/tunnel/control/transfer/device` with source route/path and destination route/path. The bridge moves only a bounded batch per request and carries one verified chunk in server memory at a time. Repeat using the returned `transferId` until `done=true`.

## Discovery

Machine-readable entry points:

- `/api/tunnel/control/bootstrap`
- `/api/tunnel/control/agent-manifest`
- `/api/tunnel/control/docs.json`
- `/api/tunnel/control/openapi`
- `/api/tunnel/control/my-device`

The stable public filesystem capability is `action=files`; pass the exact inward deed in `operation`.

## Routing and recovery

Always call `my-device` after authentication. When `humanChoiceRequired=false`, follow its selected route automatically and do not ask the human to choose primary versus recovery. After route failure, call `my-device` again rather than remembering an old tunnel name.

If a mutating action has already been accepted, observe its receipt/job before replay. Replay only when the returned receipt explicitly proves it is safe.

## Installation

macOS/Linux:

```sh
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

Windows PowerShell:

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Running the same installer again is the supported refresh/restart path. It preserves saved tunnel identity and recovery state.
