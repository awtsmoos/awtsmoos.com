// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/** Proves start, signal, and exit testimony survives in the external recovery log. */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-lifecycle-"));
const recovery = path.join(root, "recovery");
const install = path.join(root, "runtime");
fs.mkdirSync(install, { recursive: true });
fs.writeFileSync(path.join(install, "install-state.txt"), "1.0.test\n");
const source = path.resolve(__dirname, "../lib/runtime/process-lifecycle-log.js");
const script = [
	`const Lifecycle=require(${JSON.stringify(source)});`,
	`Lifecycle.install({snapshot:()=>({eventLoopLag:{lastMs:9,maxMs:3000},circuit:{level:"hard"}})});`,
	`process.once("SIGTERM",()=>process.exit(0));`,
	`setTimeout(()=>process.kill(process.pid,"SIGTERM"),20);`,
	`setTimeout(()=>{},1000);`
].join("");
const result = spawnSync(process.execPath, ["-e", script], {
	env: {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: install,
		AWTSMOOS_RECOVERY_ROOT: recovery,
		AWTSMOOS_ACTIVATION_ID: "activation-test"
	},
	encoding: "utf8",
	timeout: 5000
});
assert.equal(result.status, 0, result.stderr);
const log = path.join(recovery, "logs/process-lifecycle.jsonl");
const rows = fs.readFileSync(log, "utf8").trim().split("\n").map(JSON.parse);
assert.deepEqual(rows.map(row => row.event), ["process_start", "signal", "exit"]);
assert.ok(rows.every(row => row.version === "1.0.test"));
assert.equal(rows[0].generation, "activation-test");
assert.equal(rows[1].signal, "SIGTERM");
assert.equal(rows[1].circuit.level, "hard");
fs.rmSync(root, { recursive: true, force: true });
console.log(JSON.stringify({
	ok: true,
	suite: "process-lifecycle-log",
	startSignalExitDurable: true,
	pressureCaptured: true
}));
