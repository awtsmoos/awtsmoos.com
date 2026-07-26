B"H
Boruch Hashem
Blessed is He

# Final Execution Plan

## Inspect

- Main startup, state, connection, dispatch, response, supervisor, and release files.
- Existing worker-process abstractions and durable receipt stores.
- Server registration, acknowledgment, retry, and route authority.
- Installer bundle generation and manifest closure.

## Implement

- Add `connection-vessel` child process modules under `lib/connection-vessel/`.
- Add compact IPC protocol and process supervisor.
- Add atomic inbox/outbox mailbox modules under device state.
- Rewrite main connection integration so the parent uses IPC only.
- Add route acknowledgment handling and authoritative binding cleanup.
- Normalize circuit state semantics.
- Add atomic worktree helper and cancellation recovery test.
- Keep every source file below 120 lines with tab indentation.

## Verify

- Unit tests for IPC protocol and mailboxes.
- Main stall while connection remains registered.
- Main restart with inbox redelivery.
- Connection restart with outbox resend.
- Cancellation cannot replay.
- Root/cwd and action identity regressions.
- Stale route deduplication and garbage collection.
- Circuit state consistency.
- Release manifest and ZIP closure.
- Real local HTTP `curl | bash` install twice.
- Long-duration stall and reconnect soak.
