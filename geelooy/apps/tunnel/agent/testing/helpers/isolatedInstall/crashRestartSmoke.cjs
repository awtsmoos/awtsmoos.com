// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const AgentProcess = require("./agentProcess.cjs");
const Requests = require("./requests.cjs");
const Wait = require("./crashRestartWait.cjs");
const Group = require("../../../tools/fs/commandJob/processGroup.js");

/**
 * @file Proves crash recovery preserves process identity and truthful cancellation.
 * @description
 * The Awtsmoos does not repaint a process that died before cancellation as though
 * the later signal caused its death. Awtsmoos.com accepts either a live cancellation
 * or an already-terminal lost worker, while demanding the same birth identity and
 * a fully dead process family in both histories.
 */
async function run(options, currentProcess) {
	if (process.platform === "win32") {
		return {
			processRecord: currentProcess,
			report: { skipped: "unix_process_group_only" }
		};
	}
	const familyCommand = commandForResistantFamily();
	const started = await Requests.sendRequest(options.relay, "crash-start", {
		kind: "command",
		action: "commandRun",
		requestAction: "commandRun",
		command: familyCommand,
		cwd: options.projectRoot,
		timeoutMs: 60000,
		noMission: true
	});
	assert.equal(started.status, "running", JSON.stringify(started));
	assert.ok(started.processIdentity?.birthToken, JSON.stringify(started));
	await Wait.waitForReady(options.relay, started.jobId);
	const registrationCount = Wait.countRegistrations(options.relay);
	currentProcess.child.kill("SIGKILL");
	await currentProcess.exited;
	assert.equal(await Group.alive(started.processIdentity.processGroupId), true);
	const restarted = AgentProcess.start(options);
	await Wait.waitForNewRegistration(options.relay, restarted, registrationCount);
	const recovered = await Wait.waitForReconciled(options.relay, started.jobId);
	assert.equal(recovered.status, "detached_running", JSON.stringify(recovered));
	assert.equal(
		recovered.processIdentity.birthToken,
		started.processIdentity.birthToken
	);
	const terminal = await Requests.sendRequest(options.relay, "crash-cancel", {
		kind: "command",
		action: "commandCancel",
		jobId: started.jobId
	});
	verifyTerminal(terminal, started);
	assert.equal(await Group.alive(started.processIdentity.processGroupId), false);
	return {
		processRecord: restarted,
		report: {
			jobId: started.jobId,
			processGroupId: started.processIdentity.processGroupId,
			recoveredStatus: recovered.status,
			status: terminal.status,
			cleanup: terminal.cleanup?.state || null,
			alreadyTerminal: terminal.alreadyTerminal === true
		}
	};
}

function verifyTerminal(terminal, started) {
	assert.equal(terminal.ok, true, JSON.stringify(terminal));
	assert.equal(
		terminal.processIdentity?.birthToken,
		started.processIdentity.birthToken,
		JSON.stringify(terminal)
	);
	if (terminal.status === "cancelled") {
		assert.equal(terminal.cleanup?.state, "cleaned", JSON.stringify(terminal));
		return;
	}
	assert.equal(terminal.status, "stale_lost_worker", JSON.stringify(terminal));
	assert.equal(terminal.alreadyTerminal, true, JSON.stringify(terminal));
	assert.equal(terminal.cancelled, false, JSON.stringify(terminal));
	assert.equal(terminal.processComparison?.state, "dead", JSON.stringify(terminal));
	assert.equal(terminal.error, "recovered_process_exited_unobserved", JSON.stringify(terminal));
}

function commandForResistantFamily() {
	const script = [
		"const childProcess = require('node:child_process');",
		"process.on('SIGTERM', () => {});",
		"const child = childProcess.spawn(process.execPath, ['-e', \"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)\"], { stdio: 'ignore' });",
		"setTimeout(() => console.log(JSON.stringify({ ready: true, parentPid: process.pid, childPid: child.pid })), 150);",
		"setInterval(() => {}, 1000);"
	].join("");
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

module.exports = { commandForResistantFamily, run, verifyTerminal };
