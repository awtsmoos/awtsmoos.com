<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Awtsmoos tunnel verification — 2026-10-05

The Awtsmoos accompanies this factual record. The source suite tests contracts, isolation, routing, recovery and registries; it does not execute every registered action on a production account.

The live Mac soak completed 3,637 requests in 180.7 seconds at concurrency eight with no failed requests. Median latency was 84 ms; p95 was 338 ms. It verified a 256 KiB binary transfer with disordered chunks and final disk checksum, four concurrent owned asynchronous commands, filesystem reads/lists and health checks. Latency is local API latency, not Internet or ChatGPT latency.

An earlier run stopped after its disposable fixture disappeared from the shared temporary area. The API remained healthy. That failure is retained; cleanup is suspected, not established. The successful rerun used a separate evidence fixture.

The canonical production deployment activated commit 1a40592bd149c6c075b3b35f4781741b33943f1a. Discovery/OpenAPI returned 200. Protected routes returned 401 without credentials; MCP GET returned 405 and MCP POST initialize returned a 401 authentication challenge. These prove routing and authentication enforcement, not a signed-in end-to-end plugin invocation.

The official transactional installer refreshed the Mac with source 1a40592, preserved its identity and root, proved candidate startup, promoted it and verified registration/guardian readiness. Running instructionGet returned shliach.tunnel-native-workflow version 2.

Shliach plugin 0.86.0 was saved and its changed skills read back. Public publication and a fresh user OAuth invocation remain separate checks. Virtual OS was covered by source contract tests; authenticated production Virtual OS operations were not available in this session.

Do not commit live-fixtures, credentials or private instruction bodies. The two harnesses are repeatable local test scripts; run from the repository root. The soak deliberately writes only its own fixture.
