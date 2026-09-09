// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Proves primary retirement preserves a foreign live rescue guard and kills only its own guardian. */
const here = path.dirname(fileURLToPath(import.meta.url));
const downloads = path.resolve(here, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "awts-guard-isolation-"));
const root = path.join(temp, ".awtsmoos-tunnel");
const recovery = path.join(temp, ".awtsmoos-tunnel-recovery");
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync(path.join(recovery, "state"), { recursive: true });
const foreign = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], { stdio: "ignore" });
try {
	const legacy = path.join(recovery, "state", "supervisor-instance.lock");
	fs.mkdirSync(legacy);
	fs.writeFileSync(path.join(legacy, "owner.pid"), String(foreign.pid));
	assert.equal(retire(legacy), 0);
	assert.equal(running(foreign.pid), true);
	assert.equal(fs.existsSync(legacy), true);

	const script = path.join(root, "awtsmoos-supervisor.sh");
	fs.writeFileSync(script, "#!/usr/bin/env bash\nwhile :; do read -t 1 </dev/null || true; done\n");
	fs.chmodSync(script, 0o700);
	const owned = spawn("bash", [script], { stdio: "ignore" });
	const family = guardPath();
	fs.mkdirSync(family, { recursive: true });
	fs.writeFileSync(path.join(family, "owner.pid"), String(owned.pid));
	assert.equal(retire(family), 0);
	assert.equal(waitStopped(owned.pid), true);
	assert.equal(fs.existsSync(family), false);
} finally {
	foreign.kill("SIGKILL");
	fs.rmSync(temp, { recursive: true, force: true });
}
console.log(JSON.stringify({ ok: true, suite: "unix-foreign-supervisor-guard-isolation" }));

function shellEnv() {
	return { ...process.env, ROOT: root, RECOVERY_ROOT: recovery, AWTSMOOS_INSTALL_RUNTIME: downloads };
}
function retire(guard) {
	const code = 'source "$AWTSMOOS_INSTALL_RUNTIME/unix-runtime-family.sh"; source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-census.sh"; source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-runtime.sh"; install_event(){ :; }; install_fail(){ return 91; }; retire_supervisor_guard_path "$GUARD"';
	return spawnSync("bash", ["-c", code], { env: { ...shellEnv(), GUARD: guard } }).status;
}
function guardPath() {
	return spawnSync("bash", ["-c", 'source "$AWTSMOOS_INSTALL_RUNTIME/unix-runtime-family.sh"; runtime_family_guard_directory'], { env: shellEnv(), encoding: "utf8" }).stdout.trim();
}
function running(pid) {
	const result = spawnSync("ps", ["-p", String(pid), "-o", "state="], { encoding: "utf8" });
	return result.status === 0 && result.stdout.trim() !== "" && !result.stdout.trim().startsWith("Z");
}
function waitStopped(pid) {
	for (let index = 0; index < 40; index += 1) {
		if (!running(pid)) return true;
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
	}
	return !running(pid);
}
