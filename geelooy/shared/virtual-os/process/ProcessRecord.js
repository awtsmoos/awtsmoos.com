// B"H
/**
 * B"H
 * Chapter 60: A command became a small process record in the distributed OS.
 */
export function createProcessRecord({ id = null, command = "", cwd = ".", vessel = "unknown", simulated = false, parentId = null, metadata = {} } = {}) {
  const now = Date.now();
  return { id: id || `proc_${now}_${Math.random().toString(36).slice(2, 8)}`, parentId, command: String(command || "").trim(), cwd, vessel, simulated: Boolean(simulated), status: "running", startedAt: now, endedAt: null, durationMs: 0, exitCode: null, metadata };
}

export function finishProcessRecord(process, { exitCode = 0, status = null, endedAt = Date.now(), result = null } = {}) {
  const finalStatus = status || (Number(exitCode) === 0 ? "completed" : "failed");
  return { ...process, status: normalizeProcessStatus(finalStatus), endedAt, durationMs: Math.max(0, endedAt - process.startedAt), exitCode: Number(exitCode), result };
}

export function normalizeProcessStatus(status = "running") {
  const text = String(status || "running").toLowerCase();
  if (["done", "ok", "success", "completed"].includes(text)) return "completed";
  if (["fail", "failed", "error", "crashed"].includes(text)) return "failed";
  if (["cancel", "cancelled", "canceled", "killed"].includes(text)) return "cancelled";
  return "running";
}

export function processFromCommandResult(result = {}, extra = {}) {
  const proc = createProcessRecord({ command: result.command, cwd: result.cwd, vessel: result.vessel, simulated: result.simulated, ...extra });
  return finishProcessRecord(proc, { exitCode: result.exitCode, result });
}
