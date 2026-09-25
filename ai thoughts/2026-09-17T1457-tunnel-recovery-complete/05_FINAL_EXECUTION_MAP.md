<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Final Execution Map

The Awtsmoos renews each request by its own testimony; Awtsmoos.com recovery must distinguish a living worker heartbeat from an empty pulse that merely repeats a phase name.

## Pass A — false-liveness repair
Rewrite completely:
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-custody-record.js`
Create completely:
- `geelooy/apps/tunnel/agent/testing/mailboxCustodyProgressLease.test.cjs`

Behavior:
- phase transition renews lease;
- non-empty worker testimony renews lease, including same-worker heartbeat;
- changed non-empty result testimony renews lease;
- unchanged phase + empty worker + unchanged result preserves `lastProgressAt`, `phaseStartedAt`, and `leaseExpiresAt`;
- identity remains fenced and preserved.

Verification:
- syntax + diff check;
- focused lease test;
- exact-custody/recent-success regression;
- custody IPC/non-Mission tests;
- parent consumer self-healing/recovery/watchdog tests;
- exactly-once mutation tests.

## Pass B — recovery availability
- Inspect and refresh existing rescue in place under the same Tunnel identity.
- Verify rescue runtime/source parity and relay registration.
- Inspect `unix-recovery-lanes.sh`, guardian callers, and lane tests.
- Add an autonomous primary-absence guardian only if no equivalent loop already exists.
- Preserve HTTP/socket/file lanes as independent triggers.

## Pass C — cross-plane recovery
- Implement only a narrow authenticated device rebootstrap contract; no general shell or credential export.
- Add nonce/expiry/audit/idempotency tests.

## Release/acceptance
Explicit owned-path commit, protected-index comparison, clean-source bundle, activate exact main, reinstall primary/rescue, then injected child/consumer/launcher/relay/primary failures.
