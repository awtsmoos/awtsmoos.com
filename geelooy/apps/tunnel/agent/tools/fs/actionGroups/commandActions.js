// B"H
// Boruch Hashem
// Blessed is He

const { readCommandOutputPage } = require("../commandOutputStore.js");
const {
	startCommandJob,
	commandStatus,
	commandWait,
	commandJobOutputPage,
	cancelCommandJob
} = require("../commandJobStore.js");
const Sync = require("./commandActionSync.js");

/**
 * @file Maps public command actions to durable jobs while preserving caller-facing alias identity.
 * @description The Awtsmoos lets each alias name the doorway the caller used;
 * Awtsmoos.com separately names the canonical worker that actually served the request.
 */
function buildCommandActions(ctx) {
	const { config, payload } = ctx;
	return {
		command: () => runSmart(config, payload, "command"),
		commandRun: () => runSmart(config, payload, "commandRun"),
		shellCommand: () => runSmart(config, payload, "shellCommand"),
		commandStart: () => startCommandJob(config, payload),
		commandStatus: () => commandStatus(config, payload),
		commandPoll: () => runAlias(config, payload, "commandPoll", "commandStatus", commandStatus),
		commandWait: () => commandWait(config, payload),
		commandCancel: () => cancelCommandJob(config, payload),
		commandJobStatus: () => runAlias(config, payload, "commandJobStatus", "commandStatus", commandStatus),
		commandJobWait: () => runAlias(config, payload, "commandJobWait", "commandWait", commandWait),
		commandJobCancel: () => runAlias(config, payload, "commandJobCancel", "commandCancel", cancelCommandJob),
		commandJobOutputPage: () => commandJobOutputPage(config, payload),
		commandOutputPage: () => readAnyCommandOutputPage(config, payload)
	};
}

async function runSmart(config, payload = {}, action = "command") {
	if (Sync.shouldRunSync(payload)) return Sync.runCommand(config, payload, action);
	const job = await startCommandJob(config, {
		...payload,
		action: "commandStart",
		requestAction: action,
		actualAction: "commandStart"
	});
	return {
		...job,
		action,
		requestAction: action,
		actualAction: "commandStart",
		summary: `Started ${action} in isolated subprocess worker.`,
		mode: "async_job",
		nextAction: job.statusPayload,
		outputPage: job.stdoutPagePayload
	};
}

async function runAlias(config, payload, requestedAction, canonicalAction, handler) {
	const result = await handler(config, {
		...payload,
		action: canonicalAction,
		actualAction: canonicalAction,
		requestAction: requestedAction
	});
	return preserveAliasIdentity(result, requestedAction, canonicalAction);
}

async function readAnyCommandOutputPage(config, payload = {}) {
	if (payload.outputId || String(payload.outputRef || "").startsWith("device://")) {
		return readCommandOutputPage(config, payload);
	}
	return runAlias(config, payload, "commandOutputPage", "commandJobOutputPage", commandJobOutputPage);
}

function preserveAliasIdentity(result, requestedAction, canonicalAction) {
	const response = result && typeof result === "object"
		? { ...result }
		: { ok: false, error: "empty_action_response" };
	return {
		...response,
		action: requestedAction,
		requestAction: requestedAction,
		actualAction: canonicalAction,
		canonicalAction,
		servedByAction: canonicalAction
	};
}

module.exports = {
	buildCommandActions,
	boundedTimeout: Sync.boundedTimeout,
	preserveAliasIdentity,
	runCommand: Sync.runCommand,
	shouldRunSync: Sync.shouldRunSync
};
