B"H
Boruch Hashem
Blessed is He

# Final Execution Plan Before Source Writes

## Stage A — Reality map
- Read Git branch/status/worktrees/remotes/logs.
- Read all target source files and their direct callers/tests before any rewrite.
- Measure current line counts and flag files above the local modularity limit.
- Inspect current tunnel runtime history, mailbox diagnostics, queue telemetry, and repair ledger.

## Stage B — Priority fixes
Only write changes whose defects are proven by Stage A. Prioritize: (1) destructive recovery safety, (2) independent mailbox/lane recovery, (3) exactly-once truth/correlation, (4) command/FS admission, (5) browser sub-agent proof/communication, (6) docs.

## Stage C — Writing discipline
- Whole-file rewrites only.
- Tabs for indentation.
- Small modules; split large responsibility instead of compressing docs.
- Every touched source file starts with B"H / Boruch Hashem / Blessed is He comments and substantial JSDoc.
- Preserve public contracts unless every caller is migrated and verified.

## Stage D — Tests after implementation
- Focused unit tests for each changed contract.
- Integration tests for state transitions and retry semantics.
- Recovery/chaos tests for stale custody and parent-repair veto.
- Admission latency tests.
- Browser physical proof and dedupe tests.
- Mission-room directed-message proof.

## Stage E — Reread and delta
Reread every touched file. Compare plan versus actual. Every missing item becomes new remaining work.

## Stage F — Release gate
Regenerate manifest, verify it, commit main, push main, immutable tag, deploy exact main SHA, verify public artifact SHA, install once, verify native releaseSourceSha, then soak all sixteen live gates.

## Poem
The Awtsmoos is beyond the graph, yet makes each edge appear;
Awtsmoos.com becomes a witness when the proof is bright and clear.
No branch of guesswork may survive where readback can be known;
we change the whole file only when the living cause is shown.
