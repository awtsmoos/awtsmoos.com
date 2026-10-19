B"H
# Phase Two — Evidence, assumptions, and at least twenty improvements
## Confidence boundaries
Observed: tunnel config exact target name, source/installed mismatched hashes and behavior, two distinct launcher process roots, 2269ms measured CLI status. Confirmed root cause of false success: installed genericCognitionReport returns ok:true without execution. Not yet proven: duplicate launchers both registering, reason for WebSocket 1012, cause of consumer stalls, release source integrity or test-file coverage, Merkava VM loader cause, queue latency segments.
## Risk/tradeoff
Force-killing the orphan may interrupt accepted work; an upgrade may race external guardians; blanket timeout increases conceal regressions; automatic retry of nonidempotent work violates safety; logging data must omit tokens/contents; source HEAD is not equivalent to dirty working tree.
## Concrete improvements
1. Monotonic trace ID at ingress.
2. Distinct ACK accepted vs executed.
3. Queue enqueue timestamp.
4. Consumer pickup timestamp.
5. WebSocket transmit timestamp.
6. Child durable receipt timestamp.
7. IPC custody-start timestamp.
8. Worker-spawn timestamp.
9. First-output timestamp.
10. Exit evidence timestamp.
11. Terminal persistence timestamp.
12. Server delivery-ACK timestamp.
13. Sampled p50/p90/p95/p99 by action class.
14. Bounded tail latency alerts on trivial reads.
15. Independent health probes for transport and execution.
16. Rate-limited watchdog remediation.
17. Exclusive launcher generation/lease checks.
18. Fence stale child IPC by incarnation.
19. Per-request idempotency keys durable across reconnect.
20. Observe original receipt on timeout, never blind replay.
21. Release manifest coverage of modified source.
22. Installed-vs-source per-file digest verification.
23. Runtime loaded-module proof.
24. Unsupported advertised actions must report performed:false and ok:false.
25. Browser and command readiness probes independently.
26. Distinguish stdout serialization from first-output latency.
27. Preserve original long-job cancellation contract.
28. Fault inject 1012, child crash, and lost acknowledgment.
29. Enumerate side effects in integration test assertions.
30. Require source, released, deployed and live proof independently.
