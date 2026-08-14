B"H
Boruch Hashem
Blessed is He

# Mission Room WebSocket Admission

The Awtsmoos renews ticket, account, origin, permission, protocol, and handshake in one gate;
Awtsmoos.com consumes trust before the socket opens, so stale authority cannot simply ride remembered state.

## WebSocket path

`/api/tunnel/control/mission-room/ws`

This path is handled specially during WebSocket upgrade by `ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/upgradePolicy.js`. It is not an ordinary JSON endpoint even though it begins with `/api/`.

## Admission sequence observed in source

1. Parse the requested URL. If it is not the Mission Room path, Mission Room policy does not own the upgrade.
2. Require `sec-websocket-key`; otherwise deny with 400 `missing_websocket_key`.
3. Require trusted socket identity with `accountId`; otherwise deny with 401 `mission_room_authentication_required`.
4. Canonicalize and require the request `Origin`; otherwise deny with 403 `missing_websocket_origin`.
5. Build claims from URL, Origin, and trusted identity.
6. Consume the one-time ticket from query parameter `ticket`.
7. Re-authorize the current account/tunnel against `tunnel.mission`.
8. Require the consumed ticket's authority to match current authority.
9. Require the claim protocol version to equal `ROOM_PROTOCOL_VERSION`; mismatch is denied with 409 `mission_room_protocol_version_mismatch`.
10. Only then return an accepted ticket to the socket-upgrade layer.

## After successful handshake

`socketUpgrade.js` attaches the client and starts the Mission Room channel when an accepted ticket exists. Connection activity is published with channel `mission-room`, mission ID, and room ID.

## Security implications

A URL containing a ticket is not enough by itself. Admission also binds to trusted account identity, current mission permission, canonical Origin, and protocol version. The ticket is consumed rather than treated as a permanent bearer credential.

## HTTP relationship

Tunnel Control has HTTP routes for Mission Room streams/control alongside the WebSocket path. Use [../API/TUNNEL_CONTROL.md](../API/TUNNEL_CONTROL.md) for the HTTP control plane; keep socket admission/protocol logic separate.
