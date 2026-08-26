B"H
Boruch Hashem
Blessed is He

# Post-Source Review — Planned Versus Actual

The Awtsmoos reveals the vessel again after every write; Awtsmoos.com therefore refuses to test until intention and manifested source are compared line by line.

## Planned versus actual

- Planned pure consumer preflight module: implemented.
- Planned candidate -> preflight -> ledger -> authorization flow: implemented.
- Planned original stall reason preservation: implemented as `reason`; ledger outcome is separate `claimReason`.
- Planned mission-to-browser override: implemented as a separate action group composed last.
- Planned deterministic browser identity: implemented in an additional identity module so the bridge remains below the line ceiling.
- Planned reuse of existing browser truth path: implemented through existing website mission action plus `BrowserDelivery.wait`.

## Important review revelations

### Crash side

The current running 1.0.564 repeatedly shows the dangerous evidence pattern while this review runs: old/orphan custody can exceed 60 seconds while `recentSuccess:true`, parent pulse is fresh, filesystem workers are alive, and the circuit remains routable. The old running code currently survives because fresh-progress/runtime-pressure vetoes happen to win. The new source adds a structural second witness after candidate maturity so one stale child frame cannot jump directly into a durable repair claim.

### Browser side — first delta

The first bridge draft created a shared website root and then spawned a child. Review proved a root mission already schedules a physical browser lead, so that design could create an unnecessary extra browser turn. It was discarded before tests.

### Browser side — second delta

The corrected design maps every logical proposal to its own deterministic website mission and uses that mission's first real planned agent as the helper. `Store.publicRecord()` exposes browser workers in `mission.agents`; its separate `lead` object is orchestration metadata and is not used as browser delivery identity.

### Browser side — third delta

`PlannerPolicy.agentCount()` clamps ordinary explicit counts to at least three. Therefore the bridge now starts each proposal with `continuationOnly:true` and `allowRecursiveSubagents:false`, which is the planner's official one-agent path. One logical proposal therefore schedules one planned browser agent, not three sequential agents.

## Mechanical source evidence

Previous line audit after the first correction showed:

- `parent-consumer-recovery-preflight.js`: 82 lines
- `parent-consumer-recovery.js`: 119 lines
- `missionBrowserSpawnIdentity.js`: 46 lines
- `missionBrowserSpawnActions.js`: 117 lines before the final two single-agent fields; recheck after final rewrite is required in tests/gate.
- `actionBuilderGroups/missionActions.js`: 45 lines

All audited files had the required B\"H / Boruch Hashem / Blessed is He header and tab-indented executable code. The final bridge must be re-counted after the `continuationOnly` correction.

## Separate discovered defect

`retryAction` still has a deed-vs-transport correlation mismatch in the installed path. A real accepted `commandStart` returned 409 on retry even though `rawMismatchedResponse` contained the valid command job receipt. This is not part of the crash-preflight/browser bridge source pass, but it remains release work if the source/public fix is not already present.

## Source gate conclusion

The source architecture now matches the intended two truths: no destructive consumer repair without a post-maturity fresh witness, and no missionSpawnNext success without one real browser delivery per logical proposal. Tests have not yet been run against these new modules. The currently running 1.0.564 has not loaded them, so no live-fix claim is permitted yet.

NEXT_ACTION: rewrite focused consumer recovery regression for preflight semantics, add bridge regression with injected fake actions/Store/Delivery, then syntax and integration tests.
