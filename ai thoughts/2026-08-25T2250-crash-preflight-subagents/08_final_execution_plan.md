B"H
Boruch Hashem
Blessed is He

# Final Execution Plan

The Awtsmoos renews the next action and the proof that closes it; Awtsmoos.com therefore binds implementation to an explicit sequence rather than hope.

## Source pass

1. Resolve live instruction packs for the exact crash and mission-builder files.
2. Write `parent-consumer-recovery-preflight.js` as a pure state vessel.
3. Rewrite `parent-consumer-recovery.js` around candidate -> preflight -> ledger -> authorization.
4. Write `missionBrowserSpawnActions.js` as a dependency-injected bridge using the existing website spawn public action.
5. Rewrite `actionBuilderGroups/missionActions.js` to compose that bridge last.
6. Do not alter browser DOM/network internals unless live manifestation later proves them broken.

## Review pass

7. Re-read every touched source file completely.
8. Compare planned state machine and bridge against actual exports/call contracts.
9. Record delta before any tests.

## Test pass

10. Rewrite focused consumer recovery test for the post-maturity preflight race.
11. Add bridge test for deterministic idempotency and logical-only pending behavior.
12. Syntax-check all touched files.
13. Run existing watchdog integration and recovery ledger regressions.
14. Run focused bridge test.

## Live proof pass

15. Exercise real `missionSpawnNext` against a fresh mission with one spawn-worthy child.
16. Observe actual browser target creation.
17. Require real composer prompt verification, Send activation, accepted conversation POST, and tab-close proof.
18. Repeat the same spawn identity and prove no duplicate tab.
19. Soak the tunnel with async jobs/read traffic while inspecting parent/child PIDs.
20. Inspect lifecycle history after soak: no `watchdog_signal_requested` may coincide with fresh success.
21. If a true controlled consumer wedge can be induced safely, prove preflight still allows bounded auto-recovery.

## Release pass

22. Build from a clean public parent with only audited tunnel changes.
23. Publish immutable version/tag.
24. Activate production, verify bundle closure, reinstall Mac agent once.
25. Repeat live browser + crash soak on the installed release.

The final gate is physical: no false SIGTERM, no logical-only sub-agent fiction, no duplicated browser child, and no unexplained reconnect cycle.
