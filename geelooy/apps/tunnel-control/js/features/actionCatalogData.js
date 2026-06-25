// B"H

/**
 * B"H
 * Chapter 18: The raw actions became named instruments.
 *
 * Each action stays powerful, but the Awtsmoos places it in a visible catalog
 * before any form appears. The operator chooses first; only then does the field
 * vessel open.
 */
export const ACTION_CATALOG = Object.freeze([
  action("list", "List files", "Show directory entries.", "Files", ["safe"], { path: "." }),
  action("tree", "Tree view", "Show a bounded folder tree.", "Files", ["safe"], { path: ".", needsTree: true }),
  action("read", "Read file", "Read one file with max chars.", "Files", ["safe"], { path: "README.md" }),
  action("md", "Render markdown", "Read markdown content.", "Files", ["safe"], { path: "README.md" }),
  action("bulk", "Bulk read", "Read selected paths only.", "Files", ["advanced"], { path: ".", needsBulk: true }),
  action("write", "Write file", "Rewrite one complete file.", "Files", ["advanced"], { path: "notes.txt", needsContent: true }),
  action("bulkWrite", "Bulk write", "Rewrite multiple complete files.", "Files", ["advanced"], { path: ".", needsBulkWrite: true }),
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

/**
 * B"H
 * Builds an action record.
 *
 * @param {string} name Action name.
 * @param {string} title UI title.
 * @param {string} desc Description.
 * @param {string} group Group.
 * @param {string[]} badges Badges.
 * @param {object} defaults Defaults.
 * @returns {object} Action metadata.
 */
function action(name, title, desc, group, badges, defaults) {
  return { name, title, desc, group, badges, defaults };
}
