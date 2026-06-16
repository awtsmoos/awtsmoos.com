// B"H
import assert from "assert";
import { createProcessRecord, finishProcessRecord, normalizeProcessStatus, processFromCommandResult } from "../ProcessRecord.js";

const proc = createProcessRecord({ command: "ls", cwd: "/", vessel: "browser-tab", simulated: true, metadata: { a: 1 } });
assert.strictEqual(proc.status, "running");
assert.strictEqual(proc.command, "ls");
assert.strictEqual(proc.metadata.a, 1);
const done = finishProcessRecord(proc, { exitCode: 0, endedAt: proc.startedAt + 5, result: { ok: true } });
assert.strictEqual(done.status, "completed");
assert.strictEqual(done.durationMs, 5);
const bad = finishProcessRecord(proc, { exitCode: 2 });
assert.strictEqual(bad.status, "failed");
assert.strictEqual(normalizeProcessStatus("killed"), "cancelled");
const from = processFromCommandResult({ command: "bad", cwd: ".", vessel: "browser-storage", simulated: true, exitCode: 1 });
assert.strictEqual(from.status, "failed");
assert.strictEqual(from.vessel, "browser-storage");
console.log("BHY ProcessRecord tests passed");
