B"H
Boruch Hashem
Blessed is He

# Unbounded Brainstorm

The observed tunnel failures are not one bug. They are a family created whenever mutable process memory is treated as durable truth.

## Transport Possibilities

- Keep current single process and add longer heartbeat grace.
- Move heartbeat timers into a worker thread.
- Move the complete WebSocket connection into a child process.
- Use a tiny native watchdog process only for ping/pong.
- Use two sockets: control and bulk.
- Persist inbound and outbound envelopes in append-only device-state mailboxes.
- Acknowledge request receipt before execution.
- Replay unacknowledged responses after reconnect by canonical request ID.
- Allow the connection vessel to survive main-agent restart.
- Let the supervisor own connection vessel lifecycle independently.

## Identity and Scope Possibilities

- Seal account, route, root, cwd, request action, execution action, and correlation at ingress.
- Represent scope as an immutable JSON object passed through IPC.
- Hash canonical scope and store it in every receipt.
- Reject any retry whose supplied scope conflicts with the original receipt.
- Preserve aliases only as caller-facing names; never rewrite execution identity.

## Queue and Failure Possibilities

- Separate control, light filesystem, heavy command, and bulk traffic physically.
- Keep heartbeat and registration outside all application queues.
- Persist accepted request envelopes before dispatch.
- Persist completed response envelopes before send.
- Bound mailboxes by count and bytes.
- Garbage-collect only acknowledged responses.
- Recover orphaned inflight requests on main-agent restart.
- Ensure cancellation cannot create new work.
- Ensure polling cannot alter the original job identity.

## Route Possibilities

- One authoritative binding per account and device identity.
- Replacement generation increments only after explicit successful registration.
- Stale registrations remain diagnostic records, not routable devices.
- Periodic stale-route garbage collection.
- Server route selection always prefers authoritative binding, never newest unverified shadow.

## Operational Possibilities

- Atomic worktree setup helper.
- Atomic installer extraction and activation.
- Release inventory generated from dependency closure.
- Mandatory liveness, IPC, mailbox, replay, and cancellation tests.
- Long-running stall injection and reconnect soak tests.
- Normal `curl | bash` install and reinstall from directories with spaces and no repository.
