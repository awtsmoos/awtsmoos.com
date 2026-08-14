B"H
Boruch Hashem
Blessed is He

# Calling the APIs by Hand

The Awtsmoos gives a human a route to enter, yet authority and shape must still be learned before the call;
Awtsmoos.com makes manual use safer by tracing source, method, identity, vessels, callers, and failure wall by wall.

## The universal calling workflow

1. Search the path in [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md).
2. Confirm the owning derech in [../GENERATED/DERECH_MOUNTS.md](../GENERATED/DERECH_MOUNTS.md).
3. Check syntax health in [../GENERATED/DERECH_HEALTH.md](../GENERATED/DERECH_HEALTH.md).
4. Open [../GENERATED/API_SOURCE_CONTRACTS.md](../GENERATED/API_SOURCE_CONTRACTS.md) for method/vessel/status/header evidence.
5. Read the exact handler.
6. Check [AUTHENTICATION.md](AUTHENTICATION.md) for the family's trust boundary.
7. Search [../GENERATED/API_CALLER_INDEX.md](../GENERATED/API_CALLER_INDEX.md) for working browser-side usage.
8. Run the nearest test before relying on a mutation or security-sensitive flow.

## Example: health-style GPT route

Source inventory contains `/api/gpt/health`. Find that row first, then inspect the GPT derech for its response behavior. Do not infer that all GPT routes share the health route's method or authentication.

## Example: Wallet

For `/api/wallet/balance`, the caller index shows usage from the Wallet app. For PayPal create/capture routes, read the Wallet handler and provider environment configuration before constructing requests. Never copy live credentials into a manual example.

## Example: Social dynamic route

A pattern such as a Heichel/post/comment route can contain multiple `:variables`. Replace them with URL-encoded real identifiers; do not change them to dollar-sign names. Then inspect alias/Heichel ownership checks in addition to login state.

## Example: Tunnel Control

For `/api/tunnel/control/my-device`, `devices`, preview, pairing, filesystem, or treasury routes, use trusted session/OAuth/API-key identity. Never rely on a browser body field named `owner` or `userId` as authorization.

## Example: Mission Room WebSocket

Do not call `/api/tunnel/control/mission-room/ws` as an ordinary JSON route. Obtain the proper one-time ticket through the owning mission flow, use a WebSocket upgrade with trusted session identity and a valid Origin, and match the required room protocol version. See [../WEBSOCKETS/MISSION_ROOMS.md](../WEBSOCKETS/MISSION_ROOMS.md).

## Why no giant curl catalog appears here

The repository does not expose one uniform verb/body/auth schema, and some routes are environment/provider dependent. A copied curl command can become dangerously misleading. The generated indexes instead lead directly to the current source and real callers.
