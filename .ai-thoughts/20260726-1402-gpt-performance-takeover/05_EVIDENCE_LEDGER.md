# B"H

# Evidence Ledger

Boruch Hashem. Blessed is He. The Awtsmoos creates reality anew; this ledger records only observed Awtsmoos.com evidence.

## Measured performance

- Cold `GptApiClient.js` import before ESM boundary: 6.538, 5.411, 6.444, 6.144, 5.798 ms; mean 6.067 ms.
- Cold import after ESM boundary: 4.882, 5.776, 4.988, 6.518, 4.856 ms; mean 5.404 ms, 10.9% lower, with reparsing warnings removed.
- Temporary modern relay `/direct-health`: 0.575 ms total, 0.095 ms connect.
- Temporary modern relay `/direct-capability`: 47.025 ms total; safe 500 `direct_request_failed` because no Chrome debug port was available.
- Earlier missing-relay probe returned in approximately 0.3 ms.
- Session verdict cache: three logical status reads required two upstream session calls because the middle read reused the five-second cache.
- Extension worker startup skips 2,506 bytes of retired facade code.

## Lifecycle evidence

- Host lease unit test: first turn fresh, second reused, one close.
- Sequential leak test: 25 turns, one open, 24 reuses, maximum one active task, one close, inactive afterward.
- Cancellation tests: abort listeners removed on success and abort; late rejection observed; aborted leased turn closes and forgets host.
- Automation tests: two direct sends for two turns, opaque continuation only, twelve safe events, no prompt or key in public state.
- Extension automation test: five sends across two conversations, zero wake timers after completion, alarm listener removed on dispose.
- Temporary relay: secret scan clean and port closed after test.

## Test evidence

- Main Node matrix: 47 passed, 0 failed.
- Modern harness matrix: 10 passed, 0 failed.
- Direct route repair gate: 4 passed, 0 failed.
- Source audit: no line-count failures and no tab-indentation failures in touched production files.
- Loaded-path forbidden scan: clean. Dormant compatibility files are not imported by the extension worker.
- Runtime manifest parity: 75 source modules, no duplicates, exact installer closure.

## Privacy and enforcement evidence

- Loaded automation paths contain no bearer header construction, old backend conversation POST, session-token acquisition, raw upstream continuation IDs, custom headers, proof generator, Turnstile token, Arkose token, or hard-coded cookie machinery.
- `authState.cjs` alone observes `/api/auth/session`, discards the transient token immediately, and returns only a boolean/user-field summary.
- No prompt was sent during live verification.
- No prompt or secret appeared in temporary relay logs.

## Unavailable evidence

- Chrome 9226 and relay 38488 were initially absent.
- The temporary relay was launched only for harmless health and capability calls.
- No authenticated ChatGPT target existed, so stages requiring host-tab creation, carrier acquisition, request POST, topic subscription, answer reduction, continuation, and a real fallback answer remain live-unmeasured.
