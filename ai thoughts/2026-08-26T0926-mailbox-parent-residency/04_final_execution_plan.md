B"H
Boruch Hashem
Blessed is He

# Final Execution Plan — Parent-Resident Mailbox Recovery

The Awtsmoos lets recovery reveal truth only when the healer and the living mailbox share one vessel; Awtsmoos.com therefore keeps emergency mailbox actions beside the controller and lets isolated workers carry only deeds that do not require parent-owned objects.

## Source pass

1. Read current `tools/fs/index.js` and existing mailbox-action tests in full one last time before mutation.
2. Rewrite `tools/fs/index.js` as a complete file.
	- Add an explicit `PROCESS_OWNED_RECOVERY_ACTIONS` set containing mailbox status/export/reconcile/quarantine.
	- Keep existing socket/process/history behavior unchanged.
	- Export the recovery set for direct tests.
3. Rewrite `mailbox-emergency-registry.js` only if telemetry can remain focused; otherwise add a small sibling telemetry module.
	- Track registration state.
	- Track periodic/manual recovery attempts and latest bounded semantic result.
	- Keep payload data out of telemetry.
4. Update public mailbox status response to include recovery telemetry only if the registry owns that contract cleanly.

## Test pass after code

5. Add/extend routing regression: every mailbox emergency action is parent-resident; ordinary read/write remains executor-owned.
6. Add controller/action integration regression proving `ControllerMailbox.create()` registration is visible through `connectionMailboxStatus` in the same parent process.
7. Preserve semantic-recovery regressions:
	- expired exact pre-result custody quarantines safely;
	- result-waiting-for-ack custody is preserved;
	- ambiguity requests generation replacement instead of unsafe deletion.
8. Run syntax and line-count gates for all touched/new files.
9. Run mailbox action, child mailbox recovery, executor routing, P0 missionless recovery, and queue rejection tests.

## Live release proof

10. Regenerate the tunnel manifest from the final source after the active Mitzvah merge is closed.
11. Build/release/deploy from pushed `main` only.
12. Install the new Mac agent once.
13. Call live `connectionMailboxStatus`; it must return the same parent-custody counts visible in connection health, never `live_mailbox_unavailable` while a controller mailbox exists.
14. Soak across the 30-second custody lease under controlled load; stale exact pre-result custody must reconcile/quarantine without process replacement.
15. Verify result-waiting-for-ack custody survives recovery.
16. Inspect lifecycle history; no fresh-success false SIGTERM and no replacement solely because public recovery could not see the mailbox.

## Continuation

After this stability node passes in source, resume the active Mitzvah preservation merge, then sub-agent browser/room communication, docs discovery, UI/API modernization, and procedural-core work. Stability remains the dependency root, not an excuse to abandon the larger work graph.

NEXT_ACTION: re-read `tools/fs/index.js` and the existing connection-mailbox tests, resolve write instructions, then rewrite the parent-residency source before any new test execution.
