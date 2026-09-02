// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");

/**
 * @file Carries exact owner identity through production command idempotency scenarios.
 * @description
 * The Awtsmoos names each vessel without confusing its phase with its deed; Awtsmoos.com
 * therefore centralizes start, status, and cancel identity while tests focus on coalescing
 * and queue truth. Spawning and running are both active admissions, never duplicate work.
 */
function start(config, key, command, owner) {
	return Store.startCommandJob(config, identified(owner, {
		action: "commandRun",
		requestAction: "commandRun",
		idempotencyKey: key,
		command,
		cwd: config.root,
		timeoutMs: 10000
	}));
}

function cancel(config, jobId, owner) {
	return Store.cancelCommandJob(config, identified(owner, {
		action: "commandCancel",
		jobId
	}));
}

async function waitTerminal(config, jobId, owner) {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const status = await Store.commandStatus(config, identified(owner, {
			action: "commandStatus",
			jobId
		}));
		if (status.done) return status;
		await sleep(25);
	}
	throw new Error("idempotent_job_not_terminal");
}

function identified(owner, payload) {
	return {
		logicalAgentId: owner,
		agentSessionId: `${owner}-session`,
		generation: 1,
		...payload
	};
}

function assertActive(result) {
	assert.equal(result.ok, true);
	assert.ok(
		["spawning", "running"].includes(result.status),
		`unexpected_active_state:${result.status}`
	);
}

function nodeCommand(script) {
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".state"),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: "/bin/sh" }
	};
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	assertActive,
	cancel,
	commandConfig,
	nodeCommand,
	sleep,
	start,
	waitTerminal
};
