B"H
Boruch Hashem
Blessed is He

# Execution Plan

## Source Repairs

- Trace binding store persistence, supersession, authorization, and account cleanup.
- Add binding-retention policy, safe prune planner, execution action, audit receipt, and tests.
- Trace mailbox health and action registry.
- Add mailbox health projection plus inspect/export/quarantine/acknowledge-safe actions and tests.
- Trace Windows installer and service lifecycle.
- Add transactional activation/rollback/reinstall parity and Windows-focused tests.
- Trace WebSocket connection error surfaces and server proxy logs.
- Add structured transport failure classification and timeline diagnostics.

## Integration and Release

- Bind all new runtime modules and tests into release manifest and self-preservation.
- Pass focused, full release, installer, relay, package, syntax, tabs, line-limit, and manifest gates.
- Publish final operational branch.
- Integrate the full branch stack into a clean deployment branch without touching unrelated main-worktree changes.
- Build and verify release bytes.
- Deploy installer/release endpoint through the repository's real deployment mechanism.

## Live Rollout

- Record current identity, root, receipt, process tree, and hashes.
- Run the normal installer command against the deployed endpoint.
- Confirm identity/root preservation, schema 5 receipt, parent/child process separation, authoritative discovery, and truthful health.
- Exercise durable pending, reconnect, mailbox, and doctor actions.
- Observe a bounded live soak and verify generation remains stable.
