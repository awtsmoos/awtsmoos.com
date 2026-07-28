# B"H

# GPT Performance Takeover — Remaining Work

Boruch Hashem. Blessed is He.

The Awtsmoos renews each instant; this ledger records the verified state of Awtsmoos.com.

## Completed

- [x] Inspected the public client, API topology, direct relay, split-browser server, extension, automation, installers, and compatibility tests.
- [x] Measured cold module import, temporary relay health, capability failure latency, extension startup bytes, session-call reuse, and lifecycle counts.
- [x] Added bounded authenticated-host reuse with liveness checks, serialization, idle expiry, failure invalidation, and explicit close.
- [x] Added per-stage timing, progress events, cancellation races, timeouts, and deterministic listener cleanup.
- [x] Migrated split-browser and extension automation to the modern direct service with opaque `BH_DIRECT_` continuation keys.
- [x] Removed session-token acquisition, direct old conversation POSTs, and history polling from loaded automation paths.
- [x] Added a five-second target-origin-keyed redacted session-status cache and concurrent health checks.
- [x] Added one process-level direct-service loader and server-shutdown cleanup.
- [x] Removed two retired automation facades from extension service-worker startup.
- [x] Added a complete 75-entry relay runtime manifest consumed by both installers.
- [x] Fixed reinstall behavior so refreshed code replaces the old relay process and readiness uses `/direct-health`.
- [x] Added an explicit ESM boundary for browser ChatGPT modules.
- [x] Passed 47/47 Node tests and 10/10 modern integration harness suites.
- [x] Proved 25 sequential turns use one host, reuse it 24 times, and close once.
- [x] Started a temporary modern relay, measured health/capability, scanned logs, and confirmed shutdown.

## Unverified because the required environment was absent

- [ ] Authenticated Chrome debug port 9226: no listener was available.
- [ ] Live strict request preparation against ChatGPT: unavailable without authenticated Chrome.
- [ ] One real `page-authorized-fallback` chat: deliberately not sent because the preceding authenticated-browser gate could not pass.
- [ ] Windows installer execution: source parity is tested, but PowerShell was unavailable on this Mac.
- [ ] The full historical all-purpose UI harness remains nonzero from unrelated legacy CSS/UI assertions; the ten relay/extension suites in this task are green.

## Completion gate

The requested code, performance, privacy, cleanup, packaging, and capability-only work is complete within the available environment. Remaining items require an authenticated Chrome instance or Windows PowerShell and must not be fabricated.
