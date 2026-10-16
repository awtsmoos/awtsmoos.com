# B"H — Tunnel architecture and restoration audit

## Request path

AI caller -> authenticated `/api/tunnel/control/fs/:tunnelName` ->
`routes/protectedFs.js` (`currentIdentity`, scoped API keys, action policy) ->
`routes/fsVessel/resolveFsVessel.js` (account inventory, exact route or alias) ->
`authorizedSelection.js` (binding ownership, action manifest, liveness) ->
`nativeVessel.js` -> `nativeTunnelRegistry.js` (`ws.sendTunnelRequest`) ->
registered WebSocket device agent -> execution -> response or durable job receipt.

`my-device` uses `routes/myDevice.js` and discovery projection; its success **does not prove** `/fs` is registered or an action is routable. The former production `_awtsmoos.derech.js` mounted pairing and discovery only, while `routes/table.js` had 107 unmounted handlers. Production restoration mounts guarded `/fs`, Virtual OS, device list, and docs endpoints lazily without disturbing pairing.

## Vessel distinction

| Vessel | Registration/discovery | Route ID | Execution | Result |
|---|---|---|---|---|
| Native Mac/Linux/Hetzner agent | paired account binding + registered WebSocket, `my-device` | `tunnelId` (opaque `routeReference`) | action manifest and scoped permissions | WebSocket receipt / async job |
| Browser tunnel | authenticated browser session | browser tunnel ID | only advertised browser actions | WebSocket result |
| Hosted Virtual OS | authenticated account, synthetic device | `awtsmoos-virtual-os` | hosted VFS only; native commands currently unsupported | hosted VFS response |
| Simple HTTP tunnel | credential-bound agent-specific HTTPS poller, separate queue | `agentId` | non-shell safe diagnostics by default | authenticated agent POST + client GET result |
| Mission room | existing native agent mission actions | `missionId` + agent identity | existing native mission coordinator | room inbox/events (live two-agent test pending) |

## Authorization and safety

Capability describes implemented runtime actions; scoped API permissions are checked separately in `protectedFs.js`; native manifest, liveness and execution policy are applied before dispatch. Do not advertise hosted Virtual OS `commandRun` before sandbox implementation. `routeReference` is the preferred immutable identifier; friendly names only work if unambiguous. Stale routes should be rediscovered using `my-device`. Native browser-control is separate from shell permissions.

## Open verification items

- Authenticated external API `commandRun`/`commandWait` receipt roundtrip (Mac, Hetzner)
- Hosted Virtual OS command sandbox, outbound HTTP GET / SSRF protection
- Simple Tunnel hardening: per-device derived agent credentials, signed GET/nonce replay, authenticated poll/result, and real result POST implemented; verify the live credential-provisioned Mac and Hetzner paths
- Advanced reconnect and result replay, multi-agent mission room and task/file claim concurrency
- Verify these through real API clients before claiming acceptance.
