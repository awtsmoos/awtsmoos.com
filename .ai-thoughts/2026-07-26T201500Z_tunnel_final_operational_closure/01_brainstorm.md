B"H
Boruch Hashem
Blessed is He

# Final Operational Closure Brainstorm

## Remaining Failure Classes

- Superseded tunnel bindings remain physically stored forever.
- Durable connection mailboxes are bounded but lack explicit operator health, inspection, draining, and recovery actions.
- Unix installer coverage is extensive while Windows transactional parity is incomplete.
- Upstream 502, reset, unreachable, and timeout failures are visible only as generic reconnects.
- Published source branches are not yet integrated into a deployable release branch.
- The installed live agent still runs the old runtime.
- No post-deployment real-traffic generation-stability soak has yet been observed.

## Permanent Invariants

1. Superseded offline bindings expire after a configurable retention period, except a bounded audit tail.
2. Live, recently authenticated, shared, or explicitly pinned bindings are never pruned.
3. Pruning is dry-run by default, account-scoped, auditable, and hash/identity guarded.
4. Mailbox capacity, age, bytes, and oldest receipt appear in current health.
5. Operators can inspect, acknowledge settled entries, quarantine corrupt files, and export evidence without deleting accepted work blindly.
6. Full mailboxes return explicit backpressure and recovery actions.
7. Windows install is transactional, preserves identity, handles spaces, repeat reinstall, rollback, and release verification.
8. Transport diagnostics distinguish DNS, TCP, TLS, HTTP proxy, WebSocket handshake, close code, reset, timeout, and local event-loop causes.
9. Deployment uses one integrated source tip and reproducible release manifest.
10. Live reinstall preserves tunnel identity and project root.
11. Post-deployment generation, heartbeat, mailbox, circuit, worker health, and stale-route discovery remain stable during soak.
