B"H
Boruch Hashem
Blessed is He

# Post-Write Verification — First-Class Claude Execution

The Awtsmoos gave the command its true name, and the false absence fell away;
Awtsmoos.com now offers stable execution vessels so Claude need not guess the native ray.

## Original problem proved from live evidence

- The same native tunnel successfully executes `commandRun` for this agent.
- Claude nevertheless attempted raw actions named `command` and `shell` because MCP exposed only a generic mutation tool and incomplete schema guidance.
- Native manifest law rejected `command` because the executable action is `commandRun`.
- `shell` fell into the filesystem surface and was rejected as an unknown fs action.
- The MCP doctor treated a projected capability flag as definitive and reported `COMMAND_CAPABILITY_NOT_ADVERTISED` despite executable native-manifest testimony.

## Implemented execution surface

- `awtsmoos_run_command` maps exactly to `commandRun` and carries arbitrary command text, cwd, timeout, and bounded output controls.
- `awtsmoos_command_status` maps to `commandJobStatus`.
- `awtsmoos_command_output` maps to `commandJobOutputPage` with stdout/stderr paging.
- `awtsmoos_write_file` maps to the existing full-file `write` action.
- `awtsmoos_delete_file` maps to protected `deleteFile` and requires explicit confirm.
- `awtsmoos_browser_action` exposes a bounded allowlist of native Chrome actions rather than arbitrary guessed names.
- The generic `awtsmoos_tunnel_action` remains as an advanced escape hatch and stays honestly destructive/open-world.
- All direct tools reuse `GenericTools.tunnelAction`, preserving existing route ownership, OAuth scope, native manifest, mission-write, receipt, and retry checks.

## Protocol modularization

- Extracted tool invocation/result/resource-link handling from the oversized protocol into `toolInvocation.js`.
- `protocol.js` is now below the 120-line project ceiling and advertises the direct execution tools in server instructions.
- Handler lookup is lazy at call time, preserving the previous protocol's runtime substitution/test instrumentation semantics.

## Diagnostic repair

- `deviceTools` now derives stable executable booleans from internal native action-manifest testimony plus projected capabilities, without leaking the full internal manifest.
- `tunnelDoctor` distinguishes executable action testimony, OAuth command scope, device command grant, and fresh execution evidence.
- It no longer says commands are absent merely because one public capability projection is false.

## Verification evidence

- Focused direct execution/MCP suite: 19/19 passed.
- Previously failing mission-authorization compatibility test passed after lazy handler resolution restored old runtime semantics.
- Full OAuth + MCP + discovery suite: 104/104 passed.
- Native manifest/capability suite: 5/5 passed.
- Syntax checks passed for every touched source/test file.
- `git diff --check` passed.
- Every touched source/test file is at or below 120 lines.
- Full touched-file readback completed.
- Exact status/diff inspection shows only this mission's MCP files and planning ledger are dirty.

## Deployment gate

1. Confirm no competing deployment/import process.
2. Fetch origin and verify no remote divergence.
3. Stage only this mission's planning folder and exact MCP files.
4. Inspect cached names and run cached diff check.
5. Commit and push exact repair.
6. Prove local HEAD equals origin/main and working tree is clean.
7. Activate exact SHA through guarded production release; observe coordinator before retry if the known immediate-verifier race recurs.
8. Verify service and public release identity.
9. Verify production `tools/list` source publishes all six first-class execution tools plus generic escape hatch.
10. Verify the live native tunnel still executes a harmless command through `commandRun`.
11. Ask Claude to refresh/reconnect the connector so it fetches the new tool catalog.

## Approval boundary

The server now exposes stable per-purpose tools, which gives Claude a meaningful per-tool permission surface instead of one catch-all destructive action. Awtsmoos still cannot override an Anthropic account or organization policy that forces approval for write-capable connector tools. No dangerous tool was mislabeled read-only merely to defeat Claude's consent layer.
