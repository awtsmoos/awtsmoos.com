# B"H — Verification Matrix

## Relay tests

1. Launch at least 200 requests through one tunnel name with unique control request, client, agent, session, nonce, job, stream, project, and path identities.
2. Deliver replies in reverse and randomized order.
3. Inject a crossed response for every request, then deliver the valid response.
4. Prove crossed responses are quarantined and valid responses still resolve.
5. Retry every request before completion and prove the tunnel receives only one outbound request per control request ID.
6. Let the first HTTP waiter time out, deliver the valid tunnel response later, then prove retry returns the completed result without resending.
7. Inject unsolicited responses and prove they cannot poison completed results.
8. Prove bounded pending, completed, and quarantine stores are garbage-collected.
9. Verify command aliases preserve requested identity without accepting unrelated canonical actions.
10. Verify job ID, stream, command, working directory, project root, logical agent, session, client request, nonce, and tunnel identity.

## Mission tests

1. Run at least 200 concurrent mutations against one mission and prove no messages, heartbeats, claims, or task updates are lost.
2. Run the same load across many missions and prove unrelated missions execute concurrently.
3. Prove transaction-map entries return to zero after all operations settle.
4. Prove stale-agent recovery releases claims safely.
5. Prove a human blocking message pauses the relevant mission and a continue message resumes from the durable next action.
6. Prove daemon start creates active scheduler state, repeated start is idempotent, stop cancels future ticks, and recover restores durable state.
7. Prove scheduler ticks never overlap for one root.
8. Prove mission finalization remains evidence-gated.

## UI tests

1. Import every Tunnel Control module with syntax checking.
2. Render login, no-tunnel, connected dashboard, agent room, room chat, command worker, browser lease, and virtual OS states.
3. Verify no duplicate IDs or duplicate global event bindings.
4. Verify keyboard navigation and focus visibility.
5. Verify narrow phone, tablet, laptop, and wide desktop layouts.
6. Verify reduced-motion mode.
7. Verify legacy CSS is not loaded after the future shell becomes authoritative.
8. Verify live status labels are derived from runtime payloads.

## OS and Code tests

1. Run the existing virtual OS and Code AI Studio isolated suites before and after changes.
2. Verify database-backed VFS persistence independently of the native tunnel.
3. Verify explicit routing between native tunnel, browser vessel, and virtual OS.
4. Verify command/startup-server ownership and cancellation by agent/session identity.
5. Verify hundreds of worker records can be listed without blocking control/status traffic.

## Completion evidence

A phase closes only with:

- full readback of every rewritten file;
- syntax checks;
- focused unit tests;
- concurrency or stress tests for the changed runtime path;
- a planned-versus-actual delta note;
- preserved unrelated git changes;
- remaining work recorded honestly.
