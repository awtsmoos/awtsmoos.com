<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# Release truth and plugin integration gates

Use this when a code change is deployed or a plugin update is published. Distinguish each stage and verify the user's actual target.

## Deployment stages

- Build success proves only that the build completed. Upload success proves transfer. Activation proves the host selected a release. A live fetch proves the public URL responded. User-visible behavior needs a relevant UI or API check.
- Compare the live response with a unique marker, content hash, or revision from the intended build. Do not infer deployment from a Git push.
- If a CDN returns older bytes, report the observed response and deployment receipt separately; do not repeat a deployment blindly.
- Verify a public URL exposes only intended output, never a private source folder or credentials.
- Check desktop and mobile behavior when the change affects both. Use the smallest meaningful view and interaction checks.
- Attach each completion claim to its evidence: readback, test result, request receipt, live response, or screenshot. State remaining untested paths plainly.

## Plugin quality

- Tool names and descriptions must distinguish read, write, command, and destructive effects. Include required OAuth scope and side effects in callable tool metadata, not only a reference document.
- Use a read-only preview for consequential writes if the actual server supports one. Do not claim a preview exists without checking.
- Give operations stable request IDs when the server supports them, and use status lookup after a timeout before replay.
- In a plugin connection, a profile tool should identify the Awtsmoos account without exposing a token. A status-only health check should read no private files.
- Confirm the current ChatGPT plan and surface before instructing the user to find developer settings. Keep old GPT Actions, plugin skill instructions, MCP apps, and direct HTTPS clients conceptually separate.
- After publishing an instruction update, read back the release, then test behavior in a fresh plugin invocation when possible. A current conversation may retain an older skill snapshot.
- Do not conflate “instructions published,” “tool attached,” “OAuth granted,” “route discovered,” and “Mac action verified.” Each has its own evidence.

## Stop or continue

- Continue while a concrete, authorized, relevant next action can improve the mission. Stop when verification is sufficient and another pass finds no material issue, or when a real blocker or explicit user stop applies.
- Preserve a resumable ledger if disconnected. Never claim the agent will continue running after the session ends without an actual scheduled or persistent worker.


## Native tunnel implementation checks

- Bind a write to the verified account, live route, native device identity, and observed generation. Recheck that binding immediately before a consequential action; a healthy route alone does not prove that the intended Mac or generation is serving it.
- Native `writeIfHash` and `bulkWriteIfHashes` already exist. Prefer their hashes and inspect rollback results. A multi-file batch may roll back after a partial commit; only a final committed receipt proves all files changed. Do not call the batch a filesystem-wide atomic transaction.
- Before retrying a timed-out mutation, look up its task or transport receipt and reconcile target hashes. Reuse an idempotency key only if the deployed endpoint explicitly supports deduplication; a request ID by itself is correlation, not exactly-once execution.
- For multi-file activation, stage and verify the complete set, then use a single supported activation point. If the service has no such primitive, record each path's old hash, new hash, receipt, and rollback outcome, and report partial state precisely.
- Report transport connection, account authorization, native generation readiness, command execution, target file verification, and plugin release visibility as distinct observations.
- A plugin update can teach these checks but cannot itself install callable OAuth actions or a durable worker. Verify an action's actual tool registration and scopes, and verify worker scheduling, ownership, cancellation, and persistence before claiming either capability.
- Define a measurable done condition and a bounded improvement pass. Stop when checks establish the requested behavior and no material defect remains; preserve the ledger for future work.

## Deeper execution and recovery rules

- Separate intent ID from attempt ID. Bind approvals to account, device, native generation, path, previous hash, proposed hash, and expiry; changed bytes require a fresh approval.
- Preserve a queryable terminal receipt with outcome, final hash, and retention period. A timed-out submission with an expired or missing receipt needs target reconciliation before any replay.
- Treat deduplication as scoped by account, action, key, and payload fingerprint. Reject reuse of one explicit key with different content. In-memory cache expiry or process restart is not a durable exactly-once guarantee.
- Before rollback, compare current bytes with the batch's own post-write hash. If different, preserve the newer bytes and report rollback_conflict. A compare immediately before rename reduces a race but does not eliminate it across uncoordinated processes; use a shared lock or atomic compare-and-swap where the service provides one.
- For an atomic multi-file release, stage every file, verify content hashes, and change one version pointer. Otherwise expose a partial-write ledger and verify every rollback result.
- Resolve real target identity and symlink policy before admitting a batch. Treat case aliases and duplicate paths as one target where appropriate to the host filesystem.
- Time-stamp each health observation; check authorization, transport, intended device, active generation, command acceptance, terminal execution, file readback, and public deployment separately.
- A fresh challenge answered by the intended native process can establish recent process liveness, but not prove a later write succeeded.
- Keep mission records limited to authorized scope, exact verified artifacts, evidence, next safe step, and explicit stop condition. Reconcile stale records against live hashes and receipts on return.
- A real background worker requires durable queueing, ownership lease, heartbeat, expiration, cancellation, authorization boundary, and duplicate-executor protection. Do not claim background continuation merely because a mission ledger exists.
- The source repository may contain local unshipped fixes. Check git revision on the actual device and live service before relying on these behaviors; plugin instructions cannot deploy source changes.
