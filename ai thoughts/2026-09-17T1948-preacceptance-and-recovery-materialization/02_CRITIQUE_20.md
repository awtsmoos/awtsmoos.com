<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Twenty Corrections Before the Second Recovery Write

1. Transport heartbeat is not command-acceptance health.
2. A relay 504 must not precede the recovery reconnect intended to prevent it.
3. Late native execution after a relay timeout is ambiguous and must never be blindly replayed.
4. Recovery must preserve the original control request identity across reconnect.
5. Connection generation may rotate; Tunnel/device identity must not.
6. Pre-acceptance recovery belongs at the server routing boundary because native cannot see a request it never receives.
7. Native post-acceptance recovery remains useful and must stay intact.
8. Server pre-timeout recovery needs a bounded grace window below the terminal acceptance deadline.
9. A stale route should be fenced before re-registration is admitted.
10. Mutating requests need stronger reconciliation than read-only requests.
11. Recovery telemetry must distinguish route suspect, reconnect requested, re-registered, reconciled, and terminal timeout.
12. Installer success must materially prove declared recovery services.
13. Warning-only recovery-lane activation contradicts the “fully verified and guarded” success card.
14. Failed lane activation may preserve a healthy incumbent but may not return full success.
15. All four declared lanes must be checked, including guardian.
16. Launchd and portable fallback must expose equivalent verified outcomes.
17. Recovery lane labels must remain outside the primary service family.
18. Rescue must stay on the last proven version until primary passes the new gates.
19. Protected staged work and concurrent dirty Tunnel work remain fenced.
20. Release/failure injection must prove the repaired pre-acceptance path before broader product work resumes.
