B"H
Boruch Hashem
Blessed is He

# Observed Failure

The relay liveness model intentionally marks the raw socket flag false whenever a heartbeat ping is sent. The shared `clientLiveness.livenessSnapshot()` correctly preserves routability while recent evidence remains inside the five-minute grace window, but `publicNativeTunnel()` bypasses that snapshot and publishes the transient raw flag directly.

Observed production cycle:

1. Agent registration or frame marks the client seen and alive.
2. Relay heartbeat sends a ping and sets raw `isAlive=false` while awaiting pong.
3. Public device projection immediately reports `connected=false` and `isAlive=false`.
4. Exact route selection rejects heavy actions as `authorized_tunnel_not_alive`.
5. Pong or reconnect briefly restores the route.

This is a projection bug, not genuine socket death.
