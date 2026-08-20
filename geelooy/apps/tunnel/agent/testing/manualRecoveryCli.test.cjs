// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Cli = require("../recovery/manualCli.js");
const State = require("../recovery/stateStore.js");

/**
 * @file Proves short recovery commands verify ownership, survive typos, and restart only a disposable child.
 * @description
 * The Awtsmoos lets a hurried word remain harmless until ownership is proven;
 * Awtsmoos.com sends Emergency and Normal through one fake supervisor world, never the living tunnel woven.
 */
async function main() {
	if (process.platform === "win32") return skip("unix_process_fixture");
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-manual-recovery-"));
	let supervisor;
	try {
		writeFixture(root);
		fs.writeFileSync(path.join(root, "install-state.txt"), "9.9.9\n");
		supervisor = spawn(process.execPath, [path.join(root, "supervisor.cjs"), root], { stdio: "ignore" });
		await waitFor(() => fs.existsSync(path.join(root, "agent.pid")));
		const typo = await Cli.run(root, ["resuce"]);
		assert.equal(typo.ok, false);
		assert.equal(typo.suggestion, "rescue");
		const dry = await Cli.run(root, ["rescue", "--dry-run"]);
		assert.equal(dry.ok, true);
		assert.equal(dry.tier, 0);
		const firstPid = dry.before.childPid;
		const rescued = await Cli.run(root, ["rescue", "--timeout=5000"]);
		assert.equal(rescued.ok, true);
		assert.equal(State.read(root).tier, 0);
		assert.notEqual(rescued.current.childPid, firstPid);
		const normal = await Cli.run(root, ["normal", "--timeout=5000"]);
		assert.equal(normal.ok, true);
		assert.equal(State.read(root).tier, 5);
		assert.equal((await Cli.run(root, ["restore", "0"])).error, "confirmation_required");
		console.log(JSON.stringify({ ok: true, suite: "manual-recovery-cli", tier: State.read(root).tier }, null, 2));
	} finally {
		if (supervisor && !supervisor.killed) supervisor.kill("SIGTERM");
		await sleep(150);
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function writeFixture(root) {
	fs.writeFileSync(path.join(root, "child.cjs"), "setInterval(()=>{},1000);\n");
	fs.writeFileSync(path.join(root, "supervisor.cjs"), `
const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const root=process.argv[2];let stopping=false;let child=null;
fs.writeFileSync(path.join(root,'supervisor.pid'),String(process.pid));
function start(){child=spawn(process.execPath,[path.join(root,'child.cjs'),root],{stdio:'ignore'});fs.writeFileSync(path.join(root,'agent.pid'),String(child.pid));child.on('exit',()=>{if(!stopping)setTimeout(start,50);});}
process.on('SIGTERM',()=>{stopping=true;if(child)child.kill('SIGTERM');setTimeout(()=>process.exit(0),50);});start();setInterval(()=>{},1000);
`);
}

async function waitFor(predicate, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return true;
		await sleep(50);
	}
	throw new Error("fixture_timeout");
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function skip(reason) { console.log(JSON.stringify({ ok: true, skipped: true, reason })); }

main().catch(error => { console.error(error); process.exit(1); });
