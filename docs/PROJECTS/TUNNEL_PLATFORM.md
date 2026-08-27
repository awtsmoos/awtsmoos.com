B"H
Boruch Hashem
Blessed is He

# Tunnel Platform

The Awtsmoos lets Awtsmoos.com reach a trusted remote vessel while the platform separates installers, agent identity, HTTP control, relay transport, previews, missions, realtime rooms, compute and economic/accounting layers.

## Primary source areas

- `geelooy/api/tunnel/` — base Tunnel HTTP family.
- `geelooy/api/tunnel/control/` — large account-bound control plane.
- `geelooy/api/tunnel/install/` — installer/bundle artifacts.
- `geelooy/apps/tunnel/` and `geelooy/apps/tunnel-control/` — browser interfaces.
- dynamic-server `websocket/apps/tunnelRelay/` — live agent transport.
- Mission Room upgrade/application source — realtime collaboration/admission.

## Separate planes

Installer download, HTTP control APIs, WebSocket relay transport and Mission Room realtime admission are related but not interchangeable contracts. A route that creates work is not the same thing as the relay message that executes it on an agent.

## Trust boundary

Tunnel Control derives current identity from trusted session, OAuth or verified Tunnel API key evidence. Device/tunnel/grant/scope checks sit above that identity. Mission Room sockets additionally bind trusted account identity, canonical Origin, one-time ticket, current `tunnel.mission` authority and protocol version before handshake.

## Human manuals

- `docs/API/TUNNEL_CONTROL.md`
- `docs/SYSTEMS/TUNNEL.md`
- `docs/WEBSOCKETS/TUNNEL_RELAY.md`
- `docs/WEBSOCKETS/MISSION_ROOMS.md`
- `docs/SECURITY/REALTIME_SECURITY.md`

## Change strategy

For control routes trace auth/scope, remote action alias, relay dispatch and agent compatibility. For relay changes test registration/replacement/acknowledgement/pending recovery. For Mission Rooms test wrong identity, stale ticket, wrong Origin, revoked authority and wrong protocol version in addition to success.
