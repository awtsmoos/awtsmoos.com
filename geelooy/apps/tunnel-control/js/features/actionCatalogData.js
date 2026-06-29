// B"H

/**
 * B"H
 * Chapter 19: The catalog learned guarded remote sight.
 *
 * Share links, remote drives, preview receipts, and fake SSH are visible now,
 * but every label reminds the operator that scope, expiry, audit, and revoke
 * are the gates before any remote world opens.
 */
export const ACTION_CATALOG = Object.freeze([
  action("list", "List files", "Show directory entries.", "Files", ["safe"], { path: "." }),
  action("tree", "Tree view", "Show a bounded folder tree.", "Files", ["safe"], { path: ".", needsTree: true }),
  action("read", "Read file", "Read one file with max chars.", "Files", ["safe"], { path: "README.md" }),
  action("md", "Render markdown", "Read markdown content.", "Files", ["safe"], { path: "README.md" }),
  action("bulk", "Bulk read", "Read selected paths only.", "Files", ["advanced"], { path: ".", needsBulk: true }),
  action("write", "Write file", "Rewrite one complete file.", "Files", ["advanced"], { path: "notes.txt", needsContent: true }),
  action("bulkWrite", "Bulk write", "Rewrite multiple complete files.", "Files", ["advanced"], { path: ".", needsBulkWrite: true }),
  action("sharePreviewFile", "Share file preview", "Create a scoped expiring secret URL for one file.", "Remote Preview", ["share","safe"], { path: "README.md", ttlSeconds: 1800 }),
  action("sharePreviewServer", "Share local server", "Create a scoped live URL for a local server preview.", "Remote Preview", ["share","proxy"], { port: 3000, ttlSeconds: 1800 }),
  action("sharePreviewCommandJob", "Share command receipt", "Create a scoped URL for command job output only.", "Remote Preview", ["share","receipt"], { jobId: "", ttlSeconds: 1800 }),
  action("shareList", "List shares", "List active scoped shares for this root.", "Remote Preview", ["status"], { path: "." }),
  action("shareRevoke", "Revoke share", "Revoke one share by id or token.", "Remote Preview", ["safe"], { id: "" }),
  action("shareRevokeAll", "Revoke all shares", "Close every scoped share for this root.", "Remote Preview", ["danger-safe"], { path: "." }),
  action("shareAudit", "Share audit", "Read scoped-share audit events.", "Remote Preview", ["status"], { limit: 100 }),
  action("remoteDriveList", "Remote drives", "List owner-scoped read-only mounted roots.", "Remote Drive", ["safe"], { path: "." }),
  action("remoteDriveTree", "Remote drive tree", "Browse a bounded tree through the drive guard.", "Remote Drive", ["safe"], { path: ".", depth: 2, limit: 120 }),
  action("remoteDriveRead", "Remote drive read", "Read a non-secret file through the drive guard.", "Remote Drive", ["safe"], { path: "README.md" }),
  action("fakeSshMounts", "Fake SSH mounts", "Show virtual SSH mount layout.", "Remote Drive", ["ssh","safe"], { cwd: "/" }),
  action("fakeSshResolve", "Fake SSH resolve", "Resolve a virtual SSH path to a guarded root path.", "Remote Drive", ["ssh"], { cwd: "/tunnels/local", path: "." }),
  action("previewReceiptAttach", "Attach preview receipt", "Attach a live preview URL as Mission OS evidence.", "Mission", ["receipt"], { needsMissionId: true, nodeId: "", url: "" }),
  action("previewReceiptVerify", "Verify preview receipt", "Record remote preview verification for release court.", "Mission", ["receipt","verify"], { needsMissionId: true, nodeId: "", url: "", verified: true }),
  action("configGet", "Get config", "Inspect tunnel config.", "System", ["safe"], { path: "." }),
  action("runtimeSnapshot", "Runtime snapshot", "Capture runtime state.", "System", ["status"], { path: "." }),
  action("actionHistoryList", "Action history", "List recent action history.", "System", ["status"], { path: "." }),
  action("missionStart", "Start mission", "Create a durable autonomous mission with a renewable default lease.", "Mission", ["autopilot"], { path: ".", needsMissionGoal: true }),
  action("missionAutopilot", "Run autopilot", "Let the tunnel self-question and continue without human input until done or blocked.", "Mission", ["autopilot", "safe"], { path: ".", needsMissionId: true, needsMissionAutopilot: true }),
  action("missionBrainstorm", "Self brainstorm", "Run bounded multiple-choice self-questions for a mission.", "Mission", ["autopilot"], { path: ".", needsMissionId: true, needsMissionAutopilot: true }),
  action("missionCourt", "Mission court", "Evaluate proof, lease, entropy, and optional constitution gates.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionContinuity", "Continuity heartbeat", "Return heartbeat, court verdict, and recovery plan.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionRecovery", "Mission recovery", "List unfinished tasks, open jobs, open user messages, lease, and entropy state.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionSpawnNext", "Spawn next missions", "Create proposed follow-up missions from evidence, discovery, or constitution debt.", "Mission", ["autopilot"], { path: ".", needsMissionId: true }),
  action("missionLease", "Mission lease", "Inspect the renewable lease and soft-expiry action.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionLeaseRenew", "Renew mission lease", "Renew or change the mission lease duration.", "Mission", ["autopilot"], { path: ".", needsMissionId: true }),
  action("missionEntropy", "Mission entropy", "Score unfinished work, evidence debt, unanswered questions, and stagnation.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionConstitution", "Mission constitution", "Run the ten-gate completion constitution and return the next action.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("missionCheckpoint", "Mission checkpoint", "Persist a checkpoint and optional self-mail draft.", "Mission", ["status"], { path: ".", needsMissionId: true, needsMissionMail: true }),
  action("missionSelfMailDraft", "Self-mail draft", "Draft an agent checkpoint email without sending it.", "Mission", ["status"], { path: ".", needsMissionId: true, needsMissionMail: true }),
  action("missionReport", "Mission report", "Load current mission status, counts, lease, entropy, and continuation gate.", "Mission", ["status"], { path: ".", needsMissionId: true }),
  action("commandBatch", "Command batch", "Run approved command batches.", "Automation", ["advanced"], { path: "." }),
  action("browserDoctor", "Browser doctor", "Diagnose browser control.", "Automation", ["browser"], { path: "." })
]);
function action(name, title, desc, group, badges, defaults) { return { name, title, desc, group, badges, defaults }; }
