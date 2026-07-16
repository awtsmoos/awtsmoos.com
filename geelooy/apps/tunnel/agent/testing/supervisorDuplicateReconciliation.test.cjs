// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

/**
 * @file Proves the supervisor keeps one recorded exact-root agent and kills rivals.
 * @description
 * The Awtsmoos renews one canonical body while every duplicate loses authority.
 * Awtsmoos.com enumerates real command lines, preserves the recorded child, and
 * waits for competing launchers to finish dying before declaring reconciliation.
 */
(async () => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-supervisor-agents-"));
	const launcher = path.join(root, "awtsmoos-agent-launcher.cjs");
	fs.writeFileSync(launcher, "setInterval(() => {}, 1000);\n");
	const first = spawn(process.execPath, [launcher, root], { stdio: "ignore" });
	const second = spawn(process.execPath, [launcher, root], { stdio: "ignore" });
	try {
		await waitUntil(() => isAlive(first.pid) && isAlive(second.pid), 3000);
		fs.writeFileSync(path.join(root, "agent.pid"), `${first.pid}\n`);
		const result = spawnSync("bash", ["-c", shellScript()], {
			encoding: "utf8",
			timeout: 15000,
			env: { ...process.env, ROOT: root, DOWNLOADS: downloads }
		});
		assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
		assert.equal(Number(result.stdout.trim()), first.pid);
		await waitUntil(() => !isAlive(second.pid), 7000);
		assert.equal(isAlive(first.pid), true);
		assert.equal(isAlive(second.pid), false);
		assert.match(
			fs.readFileSync(path.join(root, "supervisor.log"), "utf8"),
			new RegExp(`agent_terminated.*pid=${second.pid}`)
		);
		console.log(JSON.stringify({
			ok: true,
			suite: "supervisor-duplicate-reconciliation",
			recordedAgentPreserved: true,
			competingAgentTerminated: true
		}, null, 2));
	} finally {
		terminate(first.pid);
		terminate(second.pid);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function shellScript() {
	return `set -u
LOG="$ROOT/supervisor.log"
PID_FILE="$ROOT/agent.pid"
CHILD_PID=""
CHILD_OWNED=0
source "$DOWNLOADS/unix-supervisor-runtime.sh"
source "$DOWNLOADS/unix-supervisor-agents.sh"
find_existing_agent`;
}

async function waitUntil(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error("process_state_timeout");
}

function isAlive(pid) {
	try { process.kill(pid, 0); return true; } catch { return false; }
}

function terminate(pid) {
	try { process.kill(pid, "SIGKILL"); } catch {}
}
