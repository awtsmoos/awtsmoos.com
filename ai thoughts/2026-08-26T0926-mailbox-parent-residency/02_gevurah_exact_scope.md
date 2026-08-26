B"H
Boruch Hashem
Blessed is He

# Gevurah — Exact Scope and Safety Boundaries

The Awtsmoos gives every recovery act a boundary; Awtsmoos.com must heal the live vessel without confusing healthy custody with abandoned custody.

## Exact files likely touched

1. `geelooy/apps/tunnel/agent/tools/fs/index.js`
	- Add an explicit process-owned recovery action set.
	- Keep connection mailbox status/export/reconcile/quarantine in the parent process.
	- Preserve socket-owned, website/process-owned, live-history, and ordinary executor routing unchanged.
2. `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-emergency-registry.js`
	- Add bounded recovery telemetry only if it can remain a small focused module.
	- Never include request payload bodies or secrets in telemetry.
3. New small telemetry helper if registry would exceed its focused responsibility/line ceiling.
4. `geelooy/apps/tunnel/agent/tools/fs/test/connectionMailboxActions.test.cjs` or a new focused residency test.
5. `geelooy/apps/tunnel/agent/lib/connection-vessel/childMailboxRecovery.test.cjs` only if existing semantic-recovery coverage needs extension.

## Non-goals for this pass

- Do not redesign mailbox persistence.
- Do not change exactly-once mutation semantics.
- Do not lower lease thresholds merely to make dashboards look green.
- Do not quarantine result-waiting-for-ack records.
- Do not make every P0 action parent-resident.
- Do not broaden process ownership beyond actions that require live in-process objects.
- Do not change application/Mitzvah source while stability is under repair.

## Required invariants

- `connectionMailboxStatus`, `connectionMailboxExport`, `connectionMailboxReconcile`, and `connectionMailboxQuarantine` must return `requiresExecutor === false`.
- Ordinary filesystem reads/writes must still use the executor.
- Controller registration and public mailbox action must share the exact same registry/module instance.
- A newly accepted custody record remains healthy during its lease.
- An expired exact pre-result record may be quarantined only through `quarantineExact`, which writes quarantine evidence before settling custody.
- A result-waiting-for-ack record must remain recoverable and must not be quarantined.
- Public action telemetry and periodic timer telemetry must describe the same mailbox state.
- No new source file exceeds 120 lines.

The narrowness is strength: one routing decision restores the healer's sight, while semantic recovery keeps the power to decide what may safely be retired.
