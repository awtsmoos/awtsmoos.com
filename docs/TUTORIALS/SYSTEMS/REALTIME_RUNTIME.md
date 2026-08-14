B"H
Boruch Hashem
Blessed is He

# Tutorial: Realtime Runtime

Awtsmoos WebSocket traffic is application-routed rather than merely “HTTP over a socket.”

## Layers

WebSocket upgrade → trusted client identity/admission → realtime platform → application registry/version → application message routing.

## Specialized systems

Mission Rooms enforce ticket/current-authority/protocol admission. Tunnel Relay manages account-bound registrations, generations, replacement/fencing, acknowledgements, and request lifecycle.

## Evidence

Use generated application/event indexes for discovery, then read the named application source. Event strings alone do not prove payload schemas.

Read `docs/WEBSOCKETS/README.md`, `MISSION_ROOMS.md`, and `TUNNEL_RELAY.md`.
