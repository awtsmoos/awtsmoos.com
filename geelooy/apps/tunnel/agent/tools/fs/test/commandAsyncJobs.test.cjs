// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../actions.js");

/**
 * @file Proves async command start, polling, output paging, and cancellation through v3 identity.
 * @description
 * The Awtsmoos gives every deed a named shliach and every observation its own faithful seal.
 * Awtsmoos.com therefore tests the public action registry without anonymous command custody:
 * one owner persists, while fresh control identities accompany each distinct request in the flow.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: legacy tests bypassed command owner identity and no longer modeled
 * production admission. Forbidden simplification: weaken owner validation to revive old tests.
 * Regression: commandAsyncJobs.test.cjs. Live proof: async polling preserves exact ownership.
 */
const OWNER = Object.freeze({
	logicalAgentId: "command-async-test-agent",
	agentSessionId: "command-async-test-session",
	generation: 1
});
let requestSequence = 0;

async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-command-job-"));
	fs.mkdirSync(path.join(root, ".git"));
	const config = configuration(root);
	try {
		await proveAsyncLifecycle(config);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
	console.log("BHY command async job tests preserve v3 owner identity");
}

async function proveAsyncLifecycle(config) {
	const node = JSON.stringify(process.execPath);
	const start = await invoke(config, {
		action: "commandStart",
		command: `${node} -e "console.log('line-4'); setTimeout(()=>process.exit(0), 250)"`,
		cwd: ".",
		allowCommands: true,
		timeoutMs: 10000
	});
	assert.equal(start.ok, true);
	assert.ok(start.jobId);
	const observed = await pollForOutput(config, start.jobId);
	assert.equal(observed.status.ok, true);
	assert.equal(observed.page.ok, true);
	assert.match(observed.page.content, /line-4/);
	if (observed.status.status === "running") {
		const cancelled = await invoke(config, { action: "commandCancel", jobId: start.jobId });
		assert.equal(cancelled.ok, true);
	}
}

async function pollForOutput(config, jobId) {
	let status = null;
	let page = null;
	for (let attempt = 0; attempt < 80; attempt += 1) {
		status = await invoke(config, { action: "commandStatus", jobId });
		page = await invoke(config, {
			action: "commandJobOutputPage",
			jobId,
			stream: "stdout",
			maxChars: 1000
		});
		if (String(page.content || "").includes("line-4")) return { page, status };
		await sleep(125);
	}
	return { page, status };
}

function invoke(config, payload) {
	const requestId = freshRequestId(payload.action, payload.jobId);
	const identified = { ...OWNER, ...payload, requestId, controlRequestId: requestId };
	return buildActions(config, identified, null)[payload.action]();
}

function freshRequestId(action, jobId) {
	requestSequence += 1;
	return `${action}-${jobId || "new"}-${process.pid}-${Date.now()}-${requestSequence}`;
}

function configuration(root) {
	return {
		root,
		allowCommands: true,
		allowWrite: true,
		allowSecrets: true,
		tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true }
	};
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
