B"H
Boruch Hashem
Blessed is He

# Final Verification

## Remaining Live-Symptom Classes Closed in Source

### Authoritative Device Discovery

- Default discovery now presents live authoritative native routes rather than every dead reinstall shadow as an equal device.
- When one or more live routes exist for an alias, only live routes remain current.
- When no live route exists, the freshest offline binding remains as one explicit fallback.
- Superseded dead bindings move into `historicalNativeDevices` with bounded retention, `totalHistorical`, and `hiddenCount`.
- Exact tunnel-ID lookup still searches all authorized bindings, so audit and recovery remain possible.
- Current warnings and recommendations no longer repeat stale-shadow noise.

### Accepted Pending Semantics

- An elapsed synchronous relay wait is now `ok: true`, HTTP 202, `state: accepted_pending`, accepted, durable, nonterminal, pending, retryable, and health-neutral.
- The envelope preserves exact request identity, resume token, and canonical `retryAction` payload.
- Missing tunnel is a real 503 not-accepted state, not pending.
- Send failure is terminal and non-retryable.
- Expiry, conflict, unavailable, unknown, and accepted-pending states are separately modeled.
- Response pruning preserves all new acceptance, durability, terminality, health, and history fields.

### Current Health Versus Historical Outcomes

- Worker status now separates `current`, `health`, `recentWindow`, and `history`.
- Only active failed workers, stale heartbeats, and reaping workers damage current health.
- Lifetime completed, failed, cancelled, and reaped totals remain available as history.
- Legacy `recent*` names remain only as explicitly labeled lifetime aliases for compatibility.
- Tunnel-control telemetry reads current worker failures instead of cumulative historical totals.
- Historical failures from tests can no longer make a currently healthy tunnel appear broken.

## Frozen-Tree Evidence

- Full changed-source audit passed: syntax, tab indentation, 120-line ceiling, manifest freshness, and `git diff --check`.
- Focused observability matrix passed 10 tests.
- Focused self-preservation passed 34 of 34 tests.
- Full release self-preservation passed 23 of 23 tests, including transactional reinstall and manifest checksum.
- Relay, discovery, response-contract, release ZIP closure, and packaged startup passed 14 of 14 tests.
- The release manifest includes `lib/runtime/worker-health.js`.

## Polling Evidence

During final verification, the old deployed relay repeatedly returned its legacy `ok: false` 202 pending envelope while durable workers remained healthy and later completed successfully. Those responses were not counted as failures or passes. They directly demonstrate the ambiguity corrected by this source branch.

## Production Isolation

The installed live runtime was not edited, reinstalled, or intentionally restarted. The main worktree was not used for these changes. The follow-up repair exists only in its isolated Git branch until integration and deployment.
