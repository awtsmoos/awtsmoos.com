<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Keep the Awtsmoos mission moving through evidence

1. Prove the connection: bootstrap, discover the account-authorized immutable route, then inspect liveness, root and relevant capabilities. A local API response proves local execution only; public metadata proves routing only. An authenticated MCP call is a separate check.
2. Ask the tunnel which instructions and plan apply. Resolve/fetch required packs and inspect matching saved mission/checklist before starting duplicate work. Store operational objectives and evidence, never private reasoning.
3. Discover exact operation schemas. The MCP awtsmoos_action_schema wrapper invokes actionSchemaTrace. Distinguish compact capability names such as files plus operation=read from direct internal action names. Preserve granted scopes and authoritative route fields.
4. Use bounded parallelism for independent reads and status polling. Start conservatively, measure latency and queue pressure, and reduce concurrency after overload or health failure. Do not launch unlimited requests or poll in a tight loop.
5. Serialize writes sharing a file or resource. Read full files, preserve other agents' edits, use atomic/hash-guarded writes where supported, then verify content and returned mutation proof. A successful HTTP status alone is insufficient.
6. Start long commands as owned asynchronous jobs using the schema's supported identity fields. Retain the returned job, receipt and mission IDs; poll status and bounded stdout/stderr pages. Use the same ownership context on follow-up calls.
7. After uncertain delivery, observe receipt/status before any resend. On reconnect, rediscover and verify immutable route/root compatibility. Never change execution surface silently or replay a mutation on another device.
8. Transfer bounded chunks with returned transfer IDs, offsets, manifests and checksums. Resume acknowledged progress; read back bytes. Use returned preview/publication URLs and fetch them, checking expected content. A Virtual OS storage path is not automatically an HTTP URL.
9. Checkpoint at milestones and before handoff: mission/plan IDs, phase/item status, verified evidence, pending jobs/receipts, relevant source version and next authorized task. Mark done only after validation. A blocker on one task does not block unrelated authorized work.
10. Refresh schemas and instructions after generation, release, root, task or scope change. Keep routine responses compact; request detailed diagnostics on failure. Record actual timings and errors without credentials or unrestricted private logs.

Continuous operation means persistent, bounded, authorized workers and recoverable state. Neither instructions nor this skill guarantee indefinite ChatGPT turns, zero failures or arbitrary access. Keep user updates factual and frequent; the Awtsmoos narrative must never invent an action's success.
