// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../../lib/config.js");
const Identity = require("../../lib/runtime/action-identity.js");
const Scope = require("../../lib/runtime/request-scope.js");
const { runCommand } = require("./run.js");
const { runNodeScript } = require("./scriptSandbox.js");
const { nodeCheck, nodeCheckTree } = require("./projectChecks.js");
const { instantTests } = require("./instantTests.js");
const Store = require("../fs/commandJobStore.js");
const MissionWrap = require("./missionWrap.js");

const COMMAND_RUN_ALIASES = ["command", "commandRun", "runCommand", "shell", "shellCommand"];
const NODE_SCRIPT_ALIASES = ["nodeScript", "nodeScriptRun", "nodeRun"];
const READ_ONLY = new Set([
	"commandStatus", "commandPoll", "commandJobStatus", "jobStatus",
	"commandWait", "commandJobWait", "waitForJob", "jobWait",
	"commandJobOutputPage", "commandOutputPage"
]);

/**
	* @file Routes command aliases while preserving requested and execution identity.
	* @description
	* The Awtsmoos keeps the caller's doorway visible while Awtsmoos.com truthfully
	* names the canonical adapter and any asynchronous worker promotion beneath it.
	*/
function marked(payload, requestedAction, adapterAction) {
	return {
		...payload,
		action: adapterAction,
		requestAction: requestedAction,
		requestedAction,
		executionAction: adapterAction,
		actualAction: adapterAction,
		adapterAction
	};
}

function preserveAliasIdentity(result, requestedAction, adapterAction) {
	const output = result && typeof result === "object"
		? { ...result }
		: { ok: false, error: "empty_command_response" };
	const execution = output.executionAction ||
		(output.actualAction && output.actualAction !== requestedAction
			? output.actualAction
			: adapterAction);
	return Identity.decorate(output, requestedAction, execution, {
		adapterAction
	});
}

async function runAlias(worker, config, payload, requestedAction, adapterAction) {
	const result = await worker(
		config,
		marked(payload, requestedAction, adapterAction)
	);
	return preserveAliasIdentity(result, requestedAction, adapterAction);
}

function aliases(worker, names, adapterAction) {
	return Object.fromEntries(names.map(name => [
		name,
		(config, payload) => runAlias(worker, config, payload, name, adapterAction)
	]));
}

const ACTIONS = {
	...aliases(runCommand, COMMAND_RUN_ALIASES, "commandRun"),
	...aliases(runNodeScript, NODE_SCRIPT_ALIASES, "nodeScript"),
	...aliases(Store.startCommandJob, ["commandStart", "commandJobStart", "commandAsync", "jobStart"], "commandStart"),
	...aliases(Store.commandStatus, ["commandStatus", "commandPoll", "commandJobStatus", "jobStatus"], "commandStatus"),
	...aliases(Store.commandWait, ["commandWait", "commandJobWait", "waitForJob", "jobWait"], "commandWait"),
	...aliases(Store.commandJobOutputPage, ["commandJobOutputPage", "commandOutputPage"], "commandJobOutputPage"),
	...aliases(Store.cancelCommandJob, ["commandCancel", "commandJobCancel"], "commandCancel"),
	nodeCheck,
	nodeCheckFile: nodeCheck,
	nodeCheckTree,
	instantTests,
	nodeInstantTests: instantTests
};

async function handleCommand(payload = {}) {
	const action = payload.action || "commandRun";
	const worker = ACTIONS[action];
	if (!worker) {
		return { ok: false, action, error: "unknown_command_action", availableActions: Object.keys(ACTIONS) };
	}
	const config = Scope.scopedConfig(loadConfig(), payload);
	const next = { ...payload, action, requestAction: payload.requestAction || action };
	if (READ_ONLY.has(action) || next.noMission === true || next.missionless === true) {
		return worker(config, next);
	}
	return MissionWrap.run(config, next, worker);
}

module.exports = {
	ACTIONS,
	COMMAND_RUN_ALIASES,
	READ_ONLY,
	handleCommand,
	preserveAliasIdentity
};
