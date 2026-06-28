B"H

# Tunnel continuation + AwtsmoosDB edit map

## Direct edits planned

1. geelooy/apps/tunnel/agent/tools/fs/mission/awdbStore.js
   - New small AwtsmoosDB helper for mission records.
   - Opens the repo AwtsmoosDB module with correct casing.
   - Stores missions, action outputs, continuation receipts, and large response payload metadata.

2. geelooy/apps/tunnel/agent/tools/fs/mission/coreStorage.js
   - Replace primary mission save/load/list with AwtsmoosDB.
   - Keep mission.json only as optional legacy compatibility or backup if DB unavailable.
   - Preserve shape of create/load/save/all exports.

3. geelooy/apps/tunnel/agent/tools/fs/actionLedger.js
   - Replace `.awtsmoos/actions/history.jsonl` and `.awtsmoos/actions/results/*.json` primary storage with AwtsmoosDB.
   - Preserve history actions API: list/get/search/replay/patch/diff/explain.
   - Fall back to existing JSON only if DB unavailable.

4. geelooy/apps/tunnel/agent/lib/response-size.js
   - Add read helpers for `awdb://...` output refs.
   - Preserve current AwtsmoosDB-first large response writes.
   - Keep non-json `.awtsmoos` fallback only for DB failure.

5. geelooy/apps/tunnel/agent/tools/fs/actionGroups/readActions.js
   - Teach read/read64 to resolve `awdb://...` or add an explicit large-response read action.
   - Needed so compacted large responses can be retrieved without JSON files.

6. geelooy/apps/tunnel/agent/tools/fs/continuationDriver.js
   - New safe driver that follows `mustCallNext` while enforcing budgets, action identity, safety stops, and user-interrupt gates.
   - This is the core “obey the tunnel” loop for non-interactive clients.

7. geelooy/apps/tunnel/agent/tools/fs/actions.js
   - Register continuation driver actions such as `missionContinueUntilGate`, `missionContinueOneHour`, or `continueMustCallNext`.

8. geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionActions.js
   - Normalize mission responses so every blocked/incomplete mission response has a continuation contract.
   - Add explicit continuation fields where missing.

9. geelooy/apps/tunnel/agent/main.js
   - Possibly add opt-in env behavior for auto-continuing `mustCallNext` from the daemon.
   - Keep default safe unless explicit config says auto-follow.

## Tests planned

10. geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionAwdbStorage.test.mjs
    - Mission save/load/all uses AWDB and avoids mission.json where configured.

11. geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/actionLedgerAwdb.test.mjs
    - Action history uses AWDB and still supports replay/get/list/search.

12. geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionContinuationDriver.test.mjs
    - Driver follows `mustCallNext`, stops on budget, checks exact action identity, and records receipts.

13. geelooy/apps/tunnel/agent/testing/largeResponseAwdbRead.test.cjs
    - Large response spills to AWDB and can be read back.

## Generated/release files after source edits

14. geelooy/apps/tunnel/agent/manifest.txt
    - Regenerate after edits.

15. geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml
16. geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml
17. geelooy/ai/central/generatedTunnelActions.js
18. geelooy/api/tunnel/control/docs/actions.js
    - Regenerate only if public action names/schemas change.

## Not direct first-pass targets

- Installer ZIP build/deploy files only after tests pass.
- UI clients only after daemon/agent semantics are verified.
