B"H
Boruch Hashem
Blessed is He

# Tunnel and Runtime Apps

The Awtsmoos bridges one machine to another without letting the boundary disappear;
Awtsmoos.com gives the Tunnel a console, a control plane, installers, grants, and runtime paths made clear.

## Tunnel Console — `geelooy/apps/tunnel/`

A very large project (roughly 1,800+ files in the immediate inventory) containing the console/agent ecosystem and installer-related material. Treat it as a platform, not a single page.

Primary backend: `/api/tunnel/*`. Installer artifacts are exposed under `/api/tunnel/install/*`.

## Tunnel Control — `geelooy/apps/tunnel-control/`

Human control-plane UI paired with `/api/tunnel/control/*`. The current backend table has 79 route keys spanning identity, pairing, grants, filesystem, previews, blobs, ephemeral results, mission rooms, live calls, compute, accounting, budgets, marketplace, and treasury.

Read [../API/TUNNEL_CONTROL.md](../API/TUNNEL_CONTROL.md) before changing the client.

## Native/runtime relationships

Tunnel apps can interact with Code, Geelooy OS, providers, remote files, previews, browser control, and native-runtime operations. `/api/runtime/native/*` is a separate native execution API family and should not be conflated with Tunnel request forwarding.

## Security boundary

Tunnel Control uses trusted server-derived identity. Client-supplied owner fields must not become an authorization source. Pairing/grant/device/API-key changes are especially security-sensitive.

## Nested copy

A separate `awtsmoos.com/geelooy/apps/tunnel-control/` exists under the nested project shell. Do not assume it is the same canonical tree as root `geelooy/apps/tunnel-control`; inspect and compare before syncing. See [../SYSTEMS/NESTED_AWTSMOOS_COM.md](../SYSTEMS/NESTED_AWTSMOOS_COM.md).

## Existing specialist docs

See `docs/tunnel/` for previously existing Tunnel-specific brainstorming/material.
