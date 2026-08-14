B"H
Boruch Hashem
Blessed is He

# Trace Realtime Admission

Realtime admission begins before ordinary message routing. A socket that reaches application code has already crossed upgrade, identity, and sometimes specialized admission boundaries.

## Investigation path

1. Begin at `websocket/core/socketUpgrade.js` and identify trusted upgrade identity.
2. Determine whether the connection is an ordinary platform application, Mission Room, or Tunnel Relay flow.
3. For Mission Rooms, trace ticket issuance, canonical tunnel authority, origin, protocol version, initial snapshot proof, and upgrade policy.
4. For ordinary versioned apps, trace registry/application ID/version selection through the message router.
5. For Tunnel Relay, trace account-bound registration/authority and correlation/lifecycle separately from built-in app routing.
6. Treat generated event strings only as search hints; inspect handlers before claiming payload semantics.
7. Verify rejection cases for missing/expired/foreign credentials and incompatible protocol versions.

## Trust rule

Client message payloads must not replace server-attached trusted socket identity. Admission and application-level authorization remain explicit contracts.
