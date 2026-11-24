//B"H
"use strict";
// End-to-end proof slice (mission §36 subset) in a disposable fixture:
// test project + fixture mission -> bounded Continue* tick -> room message
// bridged + persisted in the isolated store -> safeWrite + hash readback
// -> command job lifecycle. No production store, no real autonomy.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "awt-e2e-proof-"));
process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(tmp, "store.json");

const SafeWrite = require("../revelation/safeWrite.js");
const Jobs = require("../revelation/jobLifecycle.js");
const Bridge = require("../revelation/roomBridge.js");
const Service = require("../accountRoom/service.js");
const BT = require("../../../../../apps/tunnel/agent/tools/fs/continuation/boundedTick.js");

// 1. Test project + file write via safeWrite, readback hash must match.
const project = path.join(tmp, "project"); fs.mkdirSync(project);
const file = path.join(project, "hello.txt");
const written = SafeWrite.atomicWrite(file, "B\"H proof\n");
const readback = fs.readFileSync(file, "utf8");
assert.equal(readback, "B\"H proof\n");
assert.equal(SafeWrite.currentHash(file), SafeWrite.hashOf(readback));
assert.equal(written.hash, SafeWrite.hashOf(readback));
// Conditional write with the correct hash succeeds; a stale hash is refused.
assert.equal(SafeWrite.atomicWrite(file, "second\n", { expectedHash: written.hash }).ok, true);
const conflict = SafeWrite.atomicWrite(file, "third\n", { expectedHash: written.hash });
assert.equal(conflict.ok, false); assert.match(conflict.reason, /hash conflict/);
assert.equal(fs.readFileSync(file, "utf8"), "second\n");

// 2. Fixture mission + bounded Continue* tick via the real handler engine.
const mission = { id: "proof-mission", tasks: ["a", "b", "c"], done: [] };
const engine = { next: () => {
	const nextTask = mission.tasks.find(t => !mission.done.includes(t));
	if (!nextTask) return { done: true, keepGoing: false, verdict: "done" };
	mission.done.push(nextTask);
	return { done: false, keepGoing: true, verdict: "continue" };
} };
const tick = BT.tick(engine, { maxSteps: 2 }, "untilGate");
assert.equal(tick.stepsRun, 2); assert.equal(tick.mustCallNext, true);
const tick2 = BT.tick(engine, { maxSteps: 8 }, "untilGate");
assert.equal(tick2.done, true); assert.deepEqual(mission.done, ["a", "b", "c"]);

// 3. Room message bridged through the canonical bridge and persisted.
const shared = Bridge.toShared(
	{ id: "proof_msg_1", fromAgent: "proof-agent", kind: "status", body: "proof slice complete" },
	mission.id);
Service.join("proof-account", {}, shared);
const sent = Service.send("proof-account", {}, shared);
const replay = Service.send("proof-account", {}, shared);
assert.equal(sent.replayed, false); assert.equal(replay.replayed, true);
const onDisk = JSON.parse(fs.readFileSync(process.env.AWTSMOOS_TUNNEL_CONTROL_STORE, "utf8"));
const persisted = JSON.stringify(onDisk).includes("mission-room:proof-mission:proof_msg_1");
assert.equal(persisted, true);

// 4. Command job lifecycle: never-accepted may retry blindly; running may not.
let job = { state: "not_accepted" };
assert.equal(Jobs.mayRetryBlindly(job.state), true);
job = Jobs.transition(job, "accepted"); job = Jobs.transition(job, "queued");
job = Jobs.transition(job, "running");
assert.equal(Jobs.mayRetryBlindly(job.state), false);
const out = require("node:child_process").execFileSync(process.execPath, ["-e", "console.log(40+2)"], { encoding: "utf8" });
job = Jobs.transition(job, "completed");
assert.equal(out.trim(), "42"); assert.equal(Jobs.isTerminal(job.state), true);
assert.equal(crypto.createHash("sha256").update(out).digest("hex").length, 64);

fs.rmSync(tmp, { recursive: true, force: true });
console.log("B'H e2e proof slice: project+mission+tick+room+safeWrite+job ok");
