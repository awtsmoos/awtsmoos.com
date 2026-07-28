// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../../lib/config.js");
const Scope = require("../../lib/runtime/request-scope.js");
const { publicConfig } = require("./actionGroups/configActions.js");
const Payload = require("./actionGroups/missionActionPayload.js");
const { buildActions: makeActions } = require("./actionBuilders.js");
const Ledger = require("./actionLedger.js");
const Mission = require("./actionMissionRuntime.js");
const Replay = require("./actionReplayGuard.js");
const Runtime = require("./actionRuntime.js");
const Recovery = require("../../lib/runtime/recovery-envelope.js");

const AGENT_VERSION = "split-agent-2.0.0";

/**
	* @file Executes every filesystem deed inside its immutable request root.
	* @description
	* The Awtsmoos gives concurrent requests separate vessels. Awtsmoos.com never
	* relies on a mutable global root after the request has crossed the tunnel.
	*/
function buildActions(config, payload, webSocket) {
	return makeActions(Scope.scopedConfig(config, payload), payload, webSocket, AGENT_VERSION);
}

function recorded(config, payload, output) {
	return Ledger.record(config, payload, output, {
		historyBackend: "awtsmoosdb",
		deviceState: true,
		jsonl: false,
		gitRepoStorage: false
	});
}

async function runPlain(config, payload, webSocket) {
	const actions = buildActions(config, payload, webSocket);
	const offloaded = await Runtime.maybeOffload(config, payload);
	if (offloaded) return recorded(config, payload, offloaded);
	const output = await Runtime.runAction(payload.action, actions);
	return recorded(config, payload, output);
}

function runMissionManaged(config, payload, webSocket) {
	return Mission.runMissionManaged(config, payload, webSocket, {
		buildActions,
		recorded
	});
}

async function executeNormalized(config, payload, webSocket) {
	return Mission.missionManaged(payload)
		? runMissionManaged(config, payload, webSocket)
		: runPlain(config, payload, webSocket);
}

async function handleFsAction(rawPayload, webSocket) {
	const payload = Payload.mergedPayload(rawPayload || {});
	const config = Scope.scopedConfig(loadConfig(), payload);
	if (!payload.normalized || !payload.action || payload.action === "unknown") {
		const missing = Recovery.missingActionEnvelope(rawPayload || payload);
		return recorded(config, payload, missing);
	}
	return Replay.run(config, payload, () => executeNormalized(config, payload, webSocket));
}

function publicConfigWithVersion(config) {
	return publicConfig(config, AGENT_VERSION);
}

module.exports = {
	AGENT_VERSION,
	buildActions,
	executeNormalized,
	handleFsAction,
	healthyActive: Runtime.healthyActive,
	isFirewallStepAuthorized: Mission.isFirewallStepAuthorized,
	maybeOffload: Runtime.maybeOffload,
	missionManaged: Mission.missionManaged,
	prepareMission: Mission.prepareMission,
	publicConfig: publicConfigWithVersion,
	runMissionManaged,
	runPlain
};
