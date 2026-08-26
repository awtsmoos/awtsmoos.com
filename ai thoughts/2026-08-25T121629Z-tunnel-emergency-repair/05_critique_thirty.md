# B"H
## Boruch Hashem — Blessed is He

# Phase Three: Thirty Additional Review Gates

1. Ensure emergency fallback never recursively invokes the full installer.
2. Ensure full installer never kills a healthy emergency child until primary readiness passes.
3. Ensure normal supervisor startup does not accidentally adopt the emergency Tier-0 child as primary.
4. Keep emergency PID receipt outside replaceable runtime.
5. Preserve device identity provenance checks.
6. Preserve recovery seal verification.
7. Preserve max-active=1 in Tier-0.
8. Disable self-update in Tier-0.
9. Disable mission boot resume in Tier-0.
10. Give emergency local API a separate port.
11. Avoid assuming `node` is in interactive PATH.
12. Prefer persisted `node-bin.path`, then known resolver logic.
13. Avoid `curl | bash` inside internal fallback when local code is enough.
14. Remote bootstrap may be `curl | bash` for operator convenience but must validate subsequent payloads.
15. Keep remote endpoint stable even if normal release metadata is unavailable.
16. Do not silently downgrade primary runtime merely because metadata is unavailable.
17. Prefer newest locally healthy/sealed evidence over older committed release when selecting continuity.
18. Record version provenance for every rescue selection.
19. Make launchd bootstrap errors visible rather than discarding stderr everywhere.
20. Capture `launchctl print` state in failure detail.
21. Capture supervisor PID appearance timestamp.
22. Capture stop-marker creation reason/activation ID.
23. Make stop markers activation-scoped where feasible, not timeless booleans.
24. A stale marker from a previous activation must never kill a new guardian.
25. Test bootout/bootstrap overlap on macOS semantics with fakes.
26. Test portable fallback when launchctl is present but bootstrap never yields a process.
27. Test emergency fallback when sealed slot missing.
28. Test emergency fallback when sealed slot corrupt.
29. Test emergency fallback when already running.
30. Test docs/examples against real file names and endpoint paths.
31. Run shell syntax checks on every touched `.sh`.
32. Run targeted node tests plus tunnel regression suite.
33. Re-read every touched file after writes.
34. Diff only intended paths and preserve pre-existing dirty files.
35. Deploy to the affected Mac only after source tests prove the repair path.
