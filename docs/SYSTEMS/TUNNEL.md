B"H
Boruch Hashem
Blessed is He

# Tunnel System

The Awtsmoos bridges distance without erasing identity, consent, or machine boundary;
Awtsmoos.com makes Tunnel a platform across agent, API, app, installer, preview, mission, and treasury.

## Major source roots

- `geelooy/apps/tunnel/` — Tunnel console/agent ecosystem.
- `geelooy/apps/tunnel-control/` — control-plane UI.
- `geelooy/api/tunnel/` — Tunnel HTTP API.
- `geelooy/api/tunnel/control/` — large control-plane backend.
- `geelooy/api/tunnel/install/` — public installer/bundle endpoints.
- `geelooy/shared/tunnel/` — reusable Tunnel client/runtime material.
- `ayzarim/awtsmoosDynamicServer/websocket/` — related long-lived communication and mission-room server behavior.

## Base Tunnel API

The base derech registers status, clients, `request/:tunnelName`, and `fs/:tunnelName`.

## Control plane

Tunnel Control currently exposes 79 route-table keys. Human domains: bootstrap/identity, API keys, pairing, device grants, filesystem, previews, blobs, ephemeral results, conversations, mission rooms, live calls, provider/compute, usage/accounting, bank/budgets/marketplace, reputation, and treasury.

## Installer plane

Public endpoints distribute Windows/Linux/Unix installer material, bundle manifest/components, and agent ZIP artifacts. These are intentionally different from authenticated remote-control routes.

## Trusted identity

Control auth resolves OAuth, verified API-key, or signed-session evidence. Client-submitted owner fields are not authority. Pairing, grant, filesystem, preview, and treasury changes must preserve this invariant.

## Long-lived behavior

Mission-room and other socket flows continue under the dynamic server's WebSocket runtime after HTTP upgrade/ticket establishment. Do not document them as ordinary request/response-only APIs.

## Existing docs

Read `docs/tunnel/` for specialist pre-existing material and [../API/TUNNEL_CONTROL.md](../API/TUNNEL_CONTROL.md) for the current HTTP route-family map.
