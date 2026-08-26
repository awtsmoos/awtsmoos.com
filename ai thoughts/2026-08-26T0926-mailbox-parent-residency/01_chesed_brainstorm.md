B"H
Boruch Hashem
Blessed is He

# Chesed Brainstorm — Let Recovery Live Beside the Living Mailbox

The Awtsmoos renews every request and every recovery witness; Awtsmoos.com should never send medicine into a worker process that cannot see the wound it is meant to heal.

## Observed root cause

- The connection controller creates the real mailbox and registers it with `mailbox-emergency-registry.js` in the parent process.
- The outer priority layer correctly treats mailbox status/export/reconcile/quarantine as emergency control work.
- `tools/fs/index.js` does not treat those actions as process-owned.
- They therefore enter the isolated filesystem executor.
- The executor child reloads `actions.js` and receives a fresh module-global emergency registry where `liveMailbox` is null.
- Public recovery can therefore report `live_mailbox_unavailable` while parent health telemetry simultaneously shows real custody.
- The controller-local 2-second recovery timer can eventually reconcile those receipts, proving persistence and semantic recovery are not fundamentally broken.

## Ideal repair universe

1. Mailbox recovery/status actions execute beside the controller-owned live mailbox.
2. They never cross the filesystem executor boundary.
3. Parent residency is explicit and testable, not an accidental side effect of module caching.
4. Status reports whether a mailbox is registered and when semantic recovery last ran.
5. Recovery records last trigger, start, finish, outcome, quarantined IDs/count, replacement request, and error class without exposing payload secrets.
6. Periodic recovery remains bounded and exactly-once-safe.
7. Expired exact pre-result custody may be quarantined only after durable quarantine evidence is written.
8. Result-waiting-for-ack custody is never quarantined and never blindly redispatched.
9. Public reconcile/quarantine shares the exact same mailbox instance as periodic recovery.
10. Executor routing tests prove emergency mailbox actions remain parent-resident while ordinary filesystem actions still isolate normally.
11. A controller/action integration regression proves public status sees the registered mailbox.
12. A semantic recovery regression proves stale pre-result custody is removed without replacing the entire agent.
13. A preservation regression proves late/outbox-result custody is retained.
14. Recovery telemetry makes latency visible so minutes-long stalls cannot hide behind a green heartbeat.

The repair should be small because the architecture already contains the right healer. The revelation is not to create another watchdog, but to let the existing healer remain in the same living process as the mailbox it guards.
