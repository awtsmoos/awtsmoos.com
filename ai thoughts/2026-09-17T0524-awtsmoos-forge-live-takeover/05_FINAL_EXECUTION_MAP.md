<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final Execution Map — First Verified Runtime Slice

The Awtsmoos renews the messenger while durable truth remains; Awtsmoos.com must therefore let a browser Shliach end without letting Mission debt vanish with the tab.

## Proven call graph
`finalize.js` and `terminalFailure.js`
→ `dispatcherSessionLifecycle.settle(config, record)`
→ existing `agentSessionContinuation.afterClose(config, session, options)`
→ existing debt-aware `autoContinuation.run(...)`
→ completion-debt gate / admission / lease fencing / dispatch.

## First source pass — exact files
### Rewrite completely
1. `geelooy/apps/tunnel/agent/tools/fs/actionGroups/websiteAgents/runner/dispatcherSessionLifecycle.js`
   - Preserve terminal-state classification.
   - Resolve the just-closed dispatcher session.
   - After closure, invoke the existing continuation bridge once through the bridge contract.
   - Carry `shared_shliach` transport testimony.
   - Return the continuation receipt for observability.
   - Preserve non-terminal and non-dispatcher skip behavior.

### Create completely
2. `geelooy/apps/tunnel/agent/testing/websiteDispatcherSessionContinuation.test.cjs`
   - failed terminal website session closes as exhausted and pulses continuation;
   - clean terminal website session closes as ended and pulses continuation;
   - active website session does neither.

3. `geelooy/apps/tunnel/agent/testing/missionAutoContinuationZeroDebt.test.cjs`
   - green completion debt suppresses successor dispatch with `completion_debt_green`.

## Files read but intentionally not changed
- `agentSessionContinuation.js`: already provides idempotent terminal-event recording + continuation pulse.
- `autoContinuation/index.js`: already suppresses continuation when completion debt is green.
- `finalize.js`: already calls lifecycle on clean/attention terminalization.
- `terminalFailure.js`: already calls lifecycle after failure persistence.

## Verification sequence
1. Recheck all three target paths are still clean/missing as expected.
2. Recompute protected staged blob IDs before write.
3. Whole-file write the three targets only.
4. Full reread of all three targets.
5. Verify line counts <=120, headers, tabs, no minification.
6. Run focused tests:
   - new dispatcher continuation test;
   - new zero-debt test;
   - existing `missionAgentSessionContinuation.test.cjs`;
   - existing terminal/succession continuation tests.
7. Run syntax checks on touched files.
8. Recheck Git status and protected staged blobs.
9. Record `PLANNED / ACTUAL / DELTA` before any commit.
10. Commit only explicit owned paths if and only if tests and custody are green.

## Release boundary
A source commit is not a release. Manifest regeneration, clean committed-tree packaging, public hash verification, transactional activation, primary reinstall, rescue verification, and live continuation acceptance remain separate gates.

> A messenger may fade while the Mission still sings; the Awtsmoos renews the chain through bounded rings.
> On Awtsmoos.com no vanished chat may counterfeit completion; debt, lease, evidence, and lineage decide succession.
