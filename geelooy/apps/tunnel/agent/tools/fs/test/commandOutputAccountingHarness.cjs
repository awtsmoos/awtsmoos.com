// B"H
// Boruch Hashem
// Blessed is He

const Store = require("../commandJobStore.js");

/**
 * @file Supplies production-like command identity and canonical store calls to output regressions.
 * @description
 * The Awtsmoos gives every deed a known owner and every mutation a fresh control name.
 * Awtsmoos.com tests start, status, and output through the public command-job facade while
 * respecting durable idempotency, so an old test receipt can never impersonate today's run.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING commandOutputAccounting.test.cjs
 * Reusing one controlRequestId across independent command starts is a real idempotency
 * collision, not a harmless test shortcut. Every new command start receives a fresh deed.
 */
const IDENTITY = Object.freeze({
	logicalAgentId: "output-accounting-test-agent",
	agentSessionId: "output-accounting-test-session",
	generation: 1
});
let sequence = 0;

/** Routes one test action through the canonical command-job facade with stable ownership. */
async function action(config, payload = {}) {
	const actionName = String(payload.action || "");
	const requestId = requestIdentity(actionName, payload.jobId);
	const identified = {
		...IDENTITY,
		...payload,
		requestId,
		controlRequestId: requestId
	};
	if (actionName === "commandStart") {
		return Store.startCommandJob(config, {
			...identified,
			action: "commandRun",
			requestAction: "commandRun"
		});
	}
	if (actionName === "commandStatus") {
		return Store.commandStatus(config, identified);
	}
	if (actionName === "commandJobOutputPage") {
		return Store.commandJobOutputPage(config, identified);
	}
	throw new Error(`unsupported_output_accounting_action:${actionName}`);
}

/** Polls status only; it never replays the command mutation. */
async function waitTerminal(config, jobId) {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		const status = await action(config, { action: "commandStatus", jobId });
		if (status.done) return status;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error(`command_status_timeout:${jobId}`);
}

function page(config, jobId, stream) {
	return action(config, {
		action: "commandJobOutputPage",
		jobId,
		stream,
		maxChars: 1000
	});
}

function requestIdentity(actionName, jobId) {
	sequence += 1;
	return `${actionName}-${jobId || "new"}-${process.pid}-${Date.now()}-${sequence}`;
}

module.exports = { IDENTITY, action, page, requestIdentity, waitTerminal };
