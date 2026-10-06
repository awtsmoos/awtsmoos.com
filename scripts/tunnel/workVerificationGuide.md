<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Awtsmoos continuation and frontend release controls

Native actions are available through the existing generic awtsmoos_tunnel_action MCP tool; this change does not require another action per API feature. Use actionSchemaTrace for their exact schemas.

1. Create or reuse a Tunnel plan with tunnelPlanCreate. Call tunnelWorkBegin with task, paths, optional planId/missionId, remainingWork and nextAction. Frontend tasks additionally require frontend:true and all affected URLs.
2. Read the returned full instruction bodies; acknowledge the returned hash using tunnelWorkCheckpoint with workId and exact revision. Do not acknowledge unread bodies. If server instructions are unavailable, work begins blocked.
3. Checkpoint completed, remainingWork, nextAction, failures and reportIds after meaningful steps. Get current revision after a conflict; never overwrite another worker's checkpoint.
4. Resume with tunnelWorkResume. It checks the actual repository and current instruction hashes/generation. Inspect unrelated dirty changes; use isolated worktrees. Refresh after a changed commit or scope with tunnelWorkRefresh, then read and acknowledge instructions again.
5. Commit tested source before release verification. Call chromeVerifyFrontend against a preview of that source, at widths 390, 768 and 1440. Supply styleAssertions such as selector/property/equals, and steps such as click followed by assertVisible.
6. Source proof is mandatory: the running service release endpoint (/api/release/) must name the tested commit, or assetContracts must prove committed CSS/JS/HTML bytes match the served assets. For static previews, provide {url,path} asset contracts. A healthy old production page cannot verify new local changes.
7. Attach reportIds. Inspect every saved screenshot; call tunnelWorkReview with actual reviewNotes and the returned screenshot hashes. Automated geometry checks do not prove overlap, visual polish, or complete feature semantics.
8. Clear completed work only when it really passed. Keep failures and unfinished work explicit. tunnelWorkGate refuses stale or missing evidence, unread/changed instructions, dirty/changed commits, unfinished work, missing interactions, missing critical computed styles, missing source proof, and missing screenshot review.
9. Export tunnelWorkReleaseReceipt. Transfer that JSON outside Git on the production server, then set AWTSMOOS_FRONTEND_RELEASE_RECEIPT to its absolute path when calling remote-deploy-entry.sh with the exact target SHA. The receipt must be younger than one hour and cover the changed frontend paths. Never put a receipt inside a new commit: that would change the commit it attests.
10. After deployment, verify /api/release/, rerun real frontend behavior against production, and record results separately. Preserve the previous known working SHA and existing deployment rollback artifacts. Do not claim a pre-deploy preview is post-deploy proof.

The production guard applies to public geelooy HTML/CSS/JS frontend changes, including shared components. API and native tunnel runtime-only changes do not require visual evidence. Existing backend activation rollback checks are retained; this change does not automatically revert Git after a visual failure.

tunnelWorkHealth separates process, registered relay, command execution, file integrity, authenticated client access and rendered frontend checks. Unperformed checks remain unverified. Run harmless owned commands, exact file readback and authenticated MCP client probes separately.

Screenshots and work records live in durable device state, outside replaceable runtime and source files. Record sizes, arrays, screenshots per run, navigation waits and assertions are bounded. Browser runs use private targets and close only those targets. Existing Chrome action queue serialization is preserved.

This system supplies durable continuation and explicit NEXT_ACTION; it does not keep a ChatGPT turn alive indefinitely or silently execute arbitrary checkpoint text. Existing mission continuation remains responsible for task scheduling.

Native code lives under /Users/awtsmoos/work/awtsmoos.com/geelooy/apps/tunnel/agent. Production source lives under /mnt/HC_Volume_102267213/git/awtsmoos.com.
