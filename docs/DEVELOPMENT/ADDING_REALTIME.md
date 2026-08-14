B"H
Boruch Hashem
Blessed is He

# Adding or Changing Realtime Behavior

The Awtsmoos lets a long-lived connection carry many messages, while Awtsmoos.com must preserve transport, identity, application version, admission and domain protocol as separate vessels.

## First choose the realtime layer

The dynamic server owns a versioned `RealtimePlatform` with registered applications. Mission Rooms add pre-handshake admission policy. Tunnel Relay is a separate account-bound transport subsystem. Do not put every WebSocket feature into the same protocol merely because the transport is shared.

## Versioned application checklist

- Stable application ID.
- Explicit supported protocol version or versions.
- Registration through the application definitions/registry layer.
- Message validation and machine-readable errors.
- Trusted identity sourced from the socket session, not message payload.
- Disconnect cleanup for presence/subscriptions/state.
- Tests for malformed messages, wrong version and wrong authority.

## Admission-sensitive sockets

If connection admission depends on ticket, Origin, room, tunnel, scope or other authority, validate it before the handshake where architecture requires. Mission Rooms are the concrete example documented in `docs/WEBSOCKETS/MISSION_ROOMS.md`.

## Documentation steps

1. Update `docs/WEBSOCKETS/` human manuals.
2. Regenerate the realtime application and event indexes.
3. Confirm new event strings appear only as lexical evidence; document actual protocol meaning manually.
4. Update AI project records through regeneration, never by hand.

## Compatibility

Protocol version changes are contract changes. Prefer additive/new-version evolution when old clients must continue working; document migration and compatibility expectations explicitly.
