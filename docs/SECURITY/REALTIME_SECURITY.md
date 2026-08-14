B"H
Boruch Hashem
Blessed is He

# Realtime Security

The Awtsmoos gives every socket a living instant while Awtsmoos.com binds long-lived communication to trusted identity, admission policy, protocol version and current authority.

## Shared authentication, separate transport boundary

The dynamic server installs the same Auth verifier into HTTP and WebSocket infrastructure, but WebSocket upgrades parse their own cookies/headers and produce a trusted socket identity for the connection. Application messages must not recreate identity from message payload.

## Mission Room admission happens before handshake

For `/api/tunnel/control/mission-room/ws`, inspected source requires:

1. the correct path;
2. `sec-websocket-key`;
3. trusted identity with `accountId`;
4. canonical/accepted Origin;
5. a one-time ticket from query parameter `ticket`;
6. current `tunnel.mission` authorization for the ticket's tunnel;
7. matching current/ticket authority;
8. the current room protocol version.

Missing or changed authority is rejected before a successful WebSocket session is established.

## One-time tickets are not permanent authority

The Mission Room ticket is consumed during admission and then checked against current authorization. A previously issued ticket cannot safely replace a fresh server-side permission check when grants may have been revoked or changed.

## Versioned realtime applications

The `RealtimePlatform` routes versioned applications through a registry/router. Trusted account identity belongs to the server-side client session. Message types, application IDs and versions are domain protocol fields, not identity credentials.

## Tunnel Relay

Tunnel Relay has its own registration authority and account-bound transport lifecycle. Registration, replacement and acknowledgement behavior must preserve trusted account association. Do not merge relay-device identity with arbitrary message `accountId` or tunnel-name fields.

## Origin and browser context

Origin checking is an admission control where source explicitly requires it. Do not assume cookie authentication alone is sufficient for every browser WebSocket. Likewise, do not add permissive Origin behavior to a sensitive socket merely because an HTTP API uses broad CORS.

## Realtime change checklist

- Where does trusted client identity originate?
- Is admission checked before or after handshake?
- Does the connection require Origin, ticket, grant or scope?
- Can permission change while the connection exists?
- Which protocol versions are accepted?
- What disconnect cleanup removes presence/subscriptions/state?
- Are errors machine-readable without leaking secrets?
- Are wrong-account, stale-ticket, wrong-origin and wrong-version cases tested?
