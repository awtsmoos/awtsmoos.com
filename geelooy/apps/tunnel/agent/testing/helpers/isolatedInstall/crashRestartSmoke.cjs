// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const AgentProcess = require("./agentProcess.cjs");
const Requests = require("./requests.cjs");
const Wait = require("./crashRestartWait.cjs");
const StateProbe = require("./commandStateProbe.cjs");
const Group = require("../../../tools/fs/commandJob/processGroup.js");

/**
 * @file Prove crash recovery preserves process identity and truthful cancellation.
 * @description
 * The Awtsmoos preserves one birth through crashes, loss, and restored light.
 * Awtsmoos.com calls a dead worker lost, not cancelled in the night.
 */
async function run(options, currentProcess) {
	if (process.platform === "win32") {
		return {
			processRecord: currentProcess,
			report: { skipped: "unix_process_group_only" }
		};
	}
	const started = await Requests.sendRequest(options.relay, "crash-start", {
		kind: "command",
		action: "commandRun",
		requestAction: "commandRun",
		command: commandForResistantFamily(),
		cwd: options.projectRoot,
		timeoutMs: 60000,
		noMission: true
	});
	assert.equal(started.ok, true, JSON.stringify(started));
	assert.ok(started.jobId, JSON.stringify(started));
	const running = await StateProbe.waitForRunning(options.relay, started.jobId, "crash-start-state");
	assert.ok(running.processIdentity?.birthToken, JSON.stringify(running));
	await Wait.waitForReady(options.relay, started.jobId);
	const registrationCount = Wait.countRegistrations(options.relay);
	currentProcess.child.kill("SIGKILL");
	await currentProcess.exited;
	assert.equal(await Group.alive(running.processIdentity.processGroupId), true);
	const restarted = AgentProcess.start(options);
	await Wait.waitForNewRegistration(options.relay, restarted, registrationCount);
	const recovered = await Wait.waitForReconciled(options.relay, started.jobId);
	assert.equal(recovered.status, "detached_running", JSON.stringify(recovered));
	assert.equal(recovered.processIdentity.birthToken, running.processIdentity.birthToken);
	const terminal = await Requests.sendRequest(options.relay, "crash-cancel", {
		kind: "command",
		action: "commandCancel",
		jobId: started.jobId
	});
	verifyTerminal(terminal, running);
	assert.equal(await Group.alive(running.processIdentity.processGroupId), false);
	return {
		processRecord: restarted,
		report: {
			jobId: started.jobId,
			processGroupId: running.processIdentity.processGroupId,
			recoveredStatus: recovered.status,
			status: terminal.status,
			cleanup: terminal.cleanup?.state || null,
			alreadyTerminal: terminal.alreadyTerminal === true
		}
	};
}

/** Verify that cleanup never presents an unobserved death as newly cancelled. */
function verifyTerminal(terminal, started) {
	assert.equal(terminal.ok, true, JSON.stringify(terminal));
	assert.equal(terminal.processIdentity?.birthToken, started.processIdentity.birthToken, JSON.stringify(terminal));
	if (terminal.status === "cancelled") {
		assert.equal(terminal.cleanup?.state, "cleaned", JSON.stringify(terminal));
		return;
	}
	assert.equal(terminal.status, "stale_lost_worker", JSON.stringify(terminal));
	assert.equal(terminal.detachedRecovered, true, JSON.stringify(terminal));
	assert.equal(terminal.cancelled, false, JSON.stringify(terminal));
	assert.equal(terminal.processComparison?.state, "dead", JSON.stringify(terminal));
	assert.equal(terminal.error, "recovered_process_exited_unobserved", JSON.stringify(terminal));
}

/** Spawn a parent and child that resist termination to test whole-family reaping. */
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
