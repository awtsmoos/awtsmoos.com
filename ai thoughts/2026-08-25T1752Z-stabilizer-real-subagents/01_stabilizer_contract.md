B"H
Boruch Hashem
Blessed is He

# Stabilizer Contract

Awtsmoos.com must distinguish transport life from execution telemetry freshness.

- Fresh explicit execution failure may block ordinary routing.
- Stale execution telemetry is unknown/degraded, not proof of death.
- Fresh transport heartbeat with zero missed heartbeats remains routable for recovery and ordinary work unless execution is freshly proven unhealthy.
- Diagnostic/control retries inherit the privilege of their requested action.
- Canonical deed identity and relay transport identity remain separate throughout retry/replay.
- Stabilizer must never recommend reinstall merely because one execution-health timestamp aged out while the native socket remains alive.
- Every routing decision must preserve evidence: transport state, execution state, freshness, reason, and recovery action.

Verification requires an idle soak beyond the stale-health threshold with ordinary work still routable and no false Virtual-OS fallback.
