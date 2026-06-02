B"H
# Kesser Virtual OS Tunnel Fallback Plan

## Chapter 1: The Gate With Two Roots

The hosted Awtsmoos API already has two rivers:

1. `protectedFs.js` sends payloads to a real connected local tunnel agent through `$i.ws.sendTunnelRequest(tunnelName, payload, timeout)`.
2. `osFs.js` runs a hosted virtual filesystem dispatcher through `dispatchOsFs($i, ident.userId, payload)`.

The missing revelation is not a new filesystem from nothing. It is a shared resolver that decides which vessel should receive the same action payload:

- native local tunnel when explicitly selected or alive
- hosted virtual OS when requested by tunnelName `awtsmoos-virtual-os`
- hosted virtual OS as fallback when no tunnel is installed and `fallback=virtual-os` or `tunnelName=auto`

## Current Findings

- `geelooy/api/tunnel/control/routes/table.js` exposes:
  - `fs/awtsmoos-os` -> `osFs`
  - `fs/:tunnelName` -> `protectedFs`
- `protectedFs.js` requires a connected local tunnel and returns error on no agent.
- `osFs.js` already supports read/write/list/tree-like actions through hosted DosDB alias filesystem.
- `devices.js` currently lists `awtsmoos-virtual-os` twice and should be deduplicated.
- `myDevice.js` returns no virtual OS when no real tunnel exists; that is correct for installer onboarding, but for code agents we need another discovery mode.

## Proposed API Contract

All of these should work:

```txt
GET /api/tunnel/control/fs/awtsmoos-virtual-os?action=list&p=.
GET /api/tunnel/control/fs/auto?action=list&p=.&fallback=virtual-os
GET /api/tunnel/control/fs/<real-tunnel>?action=list&p=.
```

Optional explicit routing fields:

```json
{
  "action": "read",
  "path": "myAlias/path/file.js",
  "targetVessel": "virtual-os"
}
```

Accepted target names:

- `native`
- `local`
- `real-tunnel`
- `virtual-os`
- `awtsmoos-os`
- `auto`

## Files To Add

All files should be small and complete.

### 1. `routes/fsVessel/virtualNames.js`

Responsibilities:
- centralize virtual OS tunnel names
- prevent string drift

Exports:
- `VIRTUAL_OS_TUNNEL_NAME`
- `isVirtualOsTunnelName(name)`
- `wantsVirtualFallback(payload)`

### 2. `routes/fsVessel/tunnelClient.js`

Responsibilities:
- list connected tunnels from `$i.ws.clients`
- find tunnel by name
- send request to native tunnel

Exports:
- `listNativeTunnels($i)`
- `findNativeTunnel($i, tunnelName)`
- `sendNativeTunnel($i, tunnelName, payload, timeoutMs)`

### 3. `routes/fsVessel/virtualClient.js`

Responsibilities:
- call hosted virtual OS dispatcher
- normalize `tunnelName`, `root`, and `device` metadata

Exports:
- `sendVirtualOs($i, userId, payload)`

### 4. `routes/fsVessel/resolveFsVessel.js`

Responsibilities:
- decide where payload goes
- no network calls except optional native tunnel lookup
- return an object with `.send()`

Decision order:
1. If tunnelName is virtual OS -> virtual.
2. If payload target/fallback says virtual -> virtual.
3. If tunnelName is real and connected -> native.
4. If tunnelName is `auto` and exactly one native tunnel connected -> native.
5. If no native tunnel and fallback=virtual-os -> virtual.
6. Otherwise return structured no tunnel error.

## Files To Rewrite

### `routes/protectedFs.js`

Rewrite fully to:
- keep auth, scope, rate, usage, handoff
- replace direct `$i.ws.sendTunnelRequest` with `resolveFsVessel`
- preserve response shape and action guidance

### `routes/osFs.js`

May become thin compatibility wrapper:
- auth/scope/rate
- force `targetVessel=virtual-os`
- call shared protected dispatch helper or direct `dispatchOsFs`

### `routes/devices.js`

Rewrite fully to:
- dedupe `awtsmoos-virtual-os`
- include all real tunnels once
- maybe include `canUseWithoutAgent: true` for virtual OS

### `routes/myDevice.js`

Do not silently return virtual OS as `single_connected_tunnel`, because that would confuse installer flow.
Add optional query:

```txt
?includeVirtual=1
```

Then return:

```json
"virtualDevice": {
  "tunnelName": "awtsmoos-virtual-os",
  "kind": "virtual-os",
  "canUseWithoutAgent": true
}
```

## Tests To Add

1. `devices` returns one virtual OS, not two.
2. `fs/awtsmoos-virtual-os?action=list&p=.` reaches hosted dispatcher.
3. `fs/auto?action=list&p=.&fallback=virtual-os` works with no native tunnel.
4. `fs/realTunnel` still calls `$i.ws.sendTunnelRequest`.
5. Scope checks still block write without `tunnel.write`.

## Best Final Shape

The Awtsmoos Tunnel API becomes a vessel resolver, not only a relay.

One payload enters:

```js
{ action: "read", path: "alias/file.js" }
```

The resolver chooses:

```txt
native tunnel  -> local device filesystem
virtual-os     -> hosted user alias filesystem
```

Same read/write action names. Same auth. Same guidance. Same docs surface.

The twist: no-agent is no longer dead-end. It becomes a hosted virtual root that still obeys scopes and ownership.
