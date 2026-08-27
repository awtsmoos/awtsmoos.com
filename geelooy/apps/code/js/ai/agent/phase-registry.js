// B"H

/**
 * @file phase-registry.js
 * @description
 * B"H.
 *
 * Data-first phase registry for the vibe-coding agent timeline.
 * The Awtsmoos breathes through each collapsed row: reading, writing, testing,
 * committing, and now spawning helper agents through the tunnel council.
 */

export const AGENT_PHASES = Object.freeze({
  idle: { label: "Ready", collapsed: true, tone: "neutral" },
  connecting: { label: "Connecting to the AI stream", collapsed: true, tone: "neutral" },
  thinking: { label: "Thinking", collapsed: false, tone: "active" },
  betweenThoughts: { label: "Receiving the next step", collapsed: true, tone: "active" },
  toolStart: { label: "Running tool", collapsed: true, tone: "active" },
  readFile: { label: "Reading file", collapsed: true, tone: "active" },
  editFile: { label: "Editing file", collapsed: true, tone: "active" },
  createFile: { label: "Creating file", collapsed: true, tone: "active" },
  deleteFile: { label: "Deleting file", collapsed: true, tone: "warning" },
  testStart: { label: "Testing changes", collapsed: true, tone: "active" },
  testPass: { label: "Tests passed", collapsed: true, tone: "success" },
  testFail: { label: "Tests failed", collapsed: false, tone: "error" },
  agentCouncil: { label: "Inspecting agent council", collapsed: true, tone: "active" },
  agentSpawn: { label: "Spawning delegate agent", collapsed: true, tone: "active" },
  agentMessage: { label: "Messaging delegate agent", collapsed: true, tone: "active" },
  agentStatus: { label: "Checking delegate status", collapsed: true, tone: "active" },
  agentResult: { label: "Reading delegate result", collapsed: true, tone: "success" },
  commitPrepare: { label: "Preparing commit", collapsed: true, tone: "active" },
  commitUpload: { label: "Preparing files for GitHub", collapsed: true, tone: "active" },
  commitRemote: { label: "Creating GitHub commit", collapsed: true, tone: "active" },
  commitDone: { label: "Commit complete", collapsed: true, tone: "success" },
  done: { label: "Finished", collapsed: true, tone: "success" },
  error: { label: "Error", collapsed: false, tone: "error" }
});

/**
 * B"H
 * Gets a phase definition with fallback.
 *
 * @param {string} type Phase type.
 * @returns {object} Phase definition.
 */
export function phaseDefinition(type) {
  return AGENT_PHASES[type] || { label: type || "Working", collapsed: true, tone: "neutral" };
}

/**
 * B"H
 * Converts tool names and arguments into useful collapsed labels.
 *
 * @param {string} toolName Tool/function name.
 * @param {object} args Tool arguments.
 * @returns {{type: string, label: string}} Phase type and label.
 */
export function labelForToolCall(toolName, args = {}) {
  const raw = String(toolName || "");
  const name = raw.toLowerCase();
  const file = args.path || args.file || args.filePath || args.targetPath || args.name;
  const ai = agentToolLabel(raw, args);
  if (ai) return ai;
  if (name.includes("read")) return { type: "readFile", label: file ? `Reading ${file}` : "Reading file" };
  if (name.includes("write") || name.includes("edit") || name.includes("patch")) return { type: args.kind === "new" ? "createFile" : "editFile", label: file ? `Editing ${file}` : "Editing file" };
  if (name.includes("create")) return { type: "createFile", label: file ? `Creating ${file}` : "Creating file" };
  if (name.includes("delete") || name.includes("remove")) return { type: "deleteFile", label: file ? `Deleting ${file}` : "Deleting file" };
  if (name.includes("test") || name.includes("run")) return { type: "testStart", label: "Testing changes" };
  if (name.includes("commit") || name.includes("github") || name.includes("git")) return { type: "commitPrepare", label: "Preparing commit" };
  return { type: "toolStart", label: toolName ? `Running ${toolName}` : "Running tool" };
}

/**
 * B"H
 * Chapter 359: The code app heard the delegate footsteps.
 *
 * @param {string} toolName Raw tool name.
 * @param {object} args Tool args.
 * @returns {{type:string,label:string}|null} Agent phase or null.
 */
function agentToolLabel(toolName, args = {}) {
  const name = String(toolName || "").toLowerCase();
  if (!name.includes("aiagent")) return null;
  const provider = args.provider || "agent";
  const model = args.model ? ` · ${args.model}` : "";
  if (name.includes("list")) return { type: "agentCouncil", label: "Inspecting agent council" };
  if (name.includes("setproviderkey")) return { type: "agentCouncil", label: `Saving ${provider} key mask` };
  if (name.includes("removeproviderkey")) return { type: "agentCouncil", label: `Removing ${provider} key` };
  if (name.includes("message")) return { type: "agentMessage", label: `Messaging ${provider}${model}` };
  if (name.includes("spawn")) return { type: "agentSpawn", label: `Spawning ${provider} delegate${model}` };
  if (name.includes("status") || name.includes("tasklist")) return { type: "agentStatus", label: args.taskId ? `Checking ${args.taskId}` : "Checking delegate tasks" };
  if (name.includes("result")) return { type: "agentResult", label: args.taskId ? `Reading result ${args.taskId}` : "Reading delegate result" };
  if (name.includes("config")) return { type: "agentCouncil", label: "Saving delegate spawn limits" };
  return { type: "agentCouncil", label: `Running ${toolName}` };
}
