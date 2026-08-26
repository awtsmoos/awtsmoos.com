B"H
Boruch Hashem
Blessed is He

# Thirty Improvements Before the Final Write Pass

1. Preserve transport liveness independently from execution telemetry.
2. Represent execution health as healthy, unhealthy, or unknown/stale.
3. Route stale/unknown execution through degraded-but-live policy.
4. Block ordinary work only on fresh explicit unhealthy evidence.
5. Keep diagnostics and emergency actions routable during degraded health.
6. Make retry routing inherit the requested action's diagnostic/control class safely.
7. Separate canonical deed ID from relay transport receipt ID.
8. Preserve both identities in retry and pending envelopes.
9. Validate both identities independently and fail closed on foreign evidence.
10. Keep accepted mutations non-redispatchable.
11. Keep unaccepted recovery explicitly replay-safe.
12. Measure admission latency separately from device execution latency.
13. Keep lightweight reads/searches out of bulk starvation where bounded.
14. Keep instructionCatalog/Resolve/Get permanently protected.
15. Promote legacy instruction compatibility queries to protected instruction routing.
16. Ensure compact responses never hide grep/find/read primary results.
17. Add explicit stale-health idle-soak regression.
18. Add explicit watchdog no-false-SIGTERM regression.
19. Add launchd/supervisor continuity regression.
20. Verify sealed emergency launcher remains independent and authenticated.
21. Verify public installer repairs missing local runtime and preserves identity.
22. Expand instruction applicability tags for UI/CSS/JS/API/docs/test/deploy/refactor/shared infrastructure.
23. Add file-position/write-mode hints: whole-file rewrite, end-of-file work, generated-file caution, shared/global-file caution.
24. Add progressive-disclosure/retractable UI doctrine.
25. Add overflow/z-index/layout integrity doctrine.
26. Add complete interaction-state and animation doctrine with reduced-motion support.
27. Add data-driven API/simple-surface advanced-options doctrine.
28. Add documentation/handoff/emergency-discovery doctrine.
29. Add code-artistry doctrine: modularity, tabs, rich JSDoc, precise naming, truthful classes/composition, readable data flow.
30. Re-read every touched file, run focused tests/build/release gates, deploy from a clean isolated release tree, reinstall publicly, and perform a long live soak.
