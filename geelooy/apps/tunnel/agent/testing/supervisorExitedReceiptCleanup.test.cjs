// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const runtime = path.resolve(__dirname, "../../downloads/unix-supervisor-runtime.sh");

function run(ownerPid, childPid) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-supervisor-receipt-"));
	fs.writeFileSync(path.join(root, "agent.pid"), String(childPid));
	fs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify({
		state: "registered", ownerPid, pid: ownerPid
	}));
	fs.writeFileSync(path.join(root, "project-root-state.json"), "{}");
	fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
	fs.writeFileSync(path.join(root, "scripts/recovery-control.cjs"), "process.exit(0);\n");
	const script = [
		"set -e",
		`ROOT=${JSON.stringify(root)}`,
		`PID_FILE=${JSON.stringify(path.join(root, "agent.pid"))}`,
		`RECOVERY_LOG=${JSON.stringify(path.join(root, "recovery.log"))}`,
		`LOG=${JSON.stringify(path.join(root, "supervisor.log"))}`,
		`CHILD_PID=${childPid}`,
		"CHILD_KIND=modern",
		`source ${JSON.stringify(runtime)}`,
		"record_child_exit \"$(date +%s)\" 1"
	].join("\n");
	cp.execFileSync("bash", ["-c", script], { stdio: "pipe" });
	return root;
}

test("exited child receipt is removed immediately", () => {
	const root = run(43210, 43210);
	assert.equal(fs.existsSync(path.join(root, "connection-state.json")), false);
	assert.equal(fs.existsSync(path.join(root, "project-root-state.json")), false);
});

test("receipt owned by another incarnation is preserved", () => {
	const root = run(98765, 43210);
	assert.equal(fs.existsSync(path.join(root, "connection-state.json")), true);
	assert.equal(fs.existsSync(path.join(root, "project-root-state.json")), true);
});
