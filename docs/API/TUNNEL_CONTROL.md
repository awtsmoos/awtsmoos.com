B"H
Boruch Hashem
Blessed is He

# Tunnel Control API

The Awtsmoos joins distant machine to trusted request, with every grant kept in its place;
Awtsmoos.com exposes a wide control plane, so a human needs the families before the full route space.

## Mount

`geelooy/api/tunnel/control/_awtsmoos.derech.js` → `/api/tunnel/control/...`.

The derech delegates to `routes/table.js`. The current route table contains **79 keys**, all included in the generated route atlas.

## Route families

### Identity and bootstrap

`bootstrap`, `me`, `my-device`, `device`, `devices`, `organization`, `provider`, `openapi`, `openapi-key`, `docs`, `docs.json`.

### Keys, pairing, grants, device access

`api-keys*`, `pairing/request`, `pairing/approve`, `pairing/status`, `tunnels/access`, `tunnels/devices/revoke`, `tunnels/grants/create`, `tunnels/grants/revoke`.

### Remote filesystem and tunnel traffic

`fs/:tunnelName`, `fs/awtsmoos-os`, `handoff/:tunnelName`, plus base Tunnel routes outside Control for clients/status/request/filesystem.

### Preview and viewing

`preview/:tunnelName`, create/list/update/revoke/grant/settings routes, `view/:previewId`, `view/:previewId/raw`, `view/:previewId/proxy`, and `view/:previewId/ws`.

### Blobs and ephemeral results

`blob/:blobId`, manifest/view variants, `ephemeral/list`, `ephemeral/:resultId`, page/search/delete variants.

### Mission/collaboration/live calls

`mission-room/stream`, `live-calls`, `live-calls/stream`, conversation get/list/register, and flow-oriented controls. WebSocket mission-room behavior also exists server-side.

### Compute and accounting

`compute`, capture/history/receipt/subscription, `usage`, `resource-accounting`, `receipt/certificate`, `refund`, `budgets`, `bank`, `marketplace`, `agent-economy`.

### Treasury/economy

`treasury` and routes for advisor, agents, budgets, forecast, graph, home, marketplace, providers, reputation; plus `admin/perutas`, `admin-vault`, and treasury test/support surfaces.

## Identity model

`core/auth.js` derives trusted identity from OAuth bearer evidence, verified API keys, or signed session state. Browser-supplied owner fields are not authoritative. This is a central security invariant when adding routes.

## Human clients

`geelooy/apps/tunnel-control`, `geelooy/apps/tunnel`, shared Tunnel code, installed agents, and Awtsmoos OS/Code integrations are major consumers.

## Full list

Search `/api/tunnel/control/` in [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md). For installer downloads see [OTHER_FAMILIES.md](OTHER_FAMILIES.md).
