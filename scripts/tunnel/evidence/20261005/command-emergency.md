<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Awtsmoos command emergency, 2026-10-05

Production treated job lifecycle text such as spawning as an HTTP status, raising ERR_HTTP_INVALID_STATUS_CODE. The response normalizer now distinguishes domain JSON from transport envelopes and validates numeric HTTP codes. The legacy GPT filesystem route also validates and converts transport status rather than assigning lifecycle text.

Deployed production fixes: 5e0688737, 6ec509dca. Bounded server-side stack diagnostics: 732760e61; no packet contents are logged.

Real Mac localhost verification: command, commandRun, and commandStart each completed with exit code zero and exact stdout. A further nine jobs at concurrency three completed with correct output in 2110 ms; acceptance p50 425 ms, p95 540 ms. A twelve-job burst encountered explicit owner_command_queue_full admission control. These measurements are not public relay latency.

Public HTTPS status returned 200 with the paired tunnel ID registered. The Mac connection receipt reported registered, runtime 1.0.641, and a fresh server message. The most recent eight-minute journal sample contained zero WebSocket parsing errors and zero invalid HTTP status errors. Absence in one sample does not prove permanence.

Nine focused HTTP/control tests passed. A legacy-route regression test covers spawning, queued, completed, numeric 401, and string 429 while preserving job JSON. Its authorization and relay dependencies are fixtures, not live authenticated OAuth calls.

Limit: this ChatGPT session exposes Remote Desktop Commander but no callable Awtsmoos MCP action. Therefore authenticated ChatGPT-to-public-relay-to-Mac command execution has not been independently verified from this session. No broad authentication token was minted or borrowed.

Separate continuation work passes twelve isolated filesystem, subprocess, and browser-fixture tests. It is not part of this deployed emergency fix and has not been validated against a real ChatGPT conversation.
