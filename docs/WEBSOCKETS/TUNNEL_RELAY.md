B"H
Boruch Hashem
Blessed is He

# Tunnel Relay WebSocket System

The Awtsmoos bridges distant vessel to server while account, generation, request, acknowledgement, and replacement remain known;
Awtsmoos.com treats relay authority as a transport covenant, not a message field a contender may declare on its own.

## Source root

`ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/`

The continuation inventory found more than fifty files in this subsystem. It contains registration authority, security bridging, request dispatch, acknowledgement tracking, transfer/replacement logic, durable paths, limits, heartbeat/progress behavior, and tests.

## Registration flow observed

`register.js` calls `Security.authorizeRegistration(client, data)`. If identity fails, registration is rejected. A registration key is derived from trusted identity, then current server state is inspected for an incumbent connection. Registration authority decides whether the contender is accepted, replaces an older connection, or is fenced.

After successful registration, the server records tunnel/client state, sends an acknowledgement, recovers pending work, monitors accepted work, and publishes connection activity.

## `TUNNEL_ACK` evidence

The acknowledgement emitted by inspected source includes:

- `type: "TUNNEL_ACK"`;
- `ok: true`;
- `accountBound: true`;
- tunnel ID and tunnel name;
- whether an older connection was replaced;
- vessel type;
- protocol version;
- registration generation;
- server time.

## Replacement activity

The subsystem publishes `connection.registered` and can publish `connection.replaced` when a newer authorized contender replaces an existing connection.

## Request lifecycle

Separate source files manage dispatch, response acknowledgement, pending recovery, timeout/progress bounds, quarantine/completed retention, and durable relay state. Environment names controlling these policies appear in [../GENERATED/ENVIRONMENT_VARIABLES.md](../GENERATED/ENVIRONMENT_VARIABLES.md).

## Relationship to HTTP Tunnel Control

HTTP routes create/control devices, grants, previews, calls, missions, compute, and other management operations. Relay WebSockets are the live transport plane that can carry remote-device work. Do not flatten HTTP control routes and relay messages into one API list.
