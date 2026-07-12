// B"H

const { loadConfig } = require("../../lib/config.js");
const { publicConfig } = require("./actionGroups/configActions.js");
const Payload = require("./actionGroups/missionActionPayload.js");
const { buildActions: makeActions } = require("./actionBuilders.js");
const ActiveGuard = require("./mission/activeGuard/index.js");
const Focus = require("./mission/response/compact.js");
const Firewall = require("./mission/firewall/index.js");
const Transaction = require("./mission/transaction/index.js");
const Ledger = require("./actionLedger.js");
const Runtime = require("./actionRuntime.js");
const Finish = require("./actionFinish.js");
const ImplicitBoot = require("./mission/implicitBoot/index.js");
const Recovery = require("../../lib/runtime/recovery-envelope.js");

const AGENT_VERSION = "split-agent-2.0.0";

function isFirewallStepAuthorized(result) {
	return Boolean(result?.ok && result.authorized && result.kind === "missionNeedsStepAuthorization");
}

function buildActions(config, payload, webSocket) {
	return makeActions(config, payload, webSocket, AGENT_VERSION);
}

function recorded(config, payload, output) {
	return Ledger.record(config, payload, output, {
		historyBackend: "awtsmoosdb",
		deviceState: true,
		jsonl: false,
		gitRepoStorage: false
	});
}

function missionManaged(payload = {}) {
	const action = String(payload.action || "");
	return action.startsWith("mission") || action.startsWith("actionHistory") ||
		Boolean(payload.missionId || payload.parentMissionId || payload.missionMode === true ||
		payload.missionMode === "true" || payload.forceMission === true ||
		payload.forceMission === "true" || payload.implicitMission === true ||
		payload.implicitMission === "true");
}

async function guardActive(config, payload, active) {
	if (!active) return null;
	const result = Firewall.check(config, payload.action, active, payload);
	if (!result.ok) return Finish.firewallBlock(payload.action, result, active, payload);
	if (isFirewallStepAuthorized(result)) return null;
	return ActiveGuard.check(config, payload);
}

async function prepareMission(config, payload) {
	const active = await Runtime.healthyActive(config);
	const boot = await ImplicitBoot.maybeStart(config, payload, active);
	return { active: boot?.lock || active, boot };
}

async function runPlain(config, payload, webSocket) {
	const actions = buildActions(config, payload, webSocket);
	const offloaded = await Runtime.maybeOffload(config, payload);
	if (offloaded) return recorded(config, payload, offloaded);
	return recorded(config, payload, await Runtime.runAction(payload.action, actions));
}

async function executeMissionAction(config, payload, webSocket, mission) {
	const result = await Runtime.runAction(payload.action, buildActions(config, payload, webSocket));
	const finished = Finish.finishAction(config, payload, result);
	return recorded(config, payload, ImplicitBoot.annotate(finished, mission.boot));
}

async function runMissionManaged(config, payload, webSocket) {
	const mission = await prepareMission(config, payload);
	const offloaded = await Runtime.maybeOffload(config, payload);
	if (offloaded) {
		return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(offloaded, mission.boot), payload));
	}
	const block = await guardActive(config, payload, mission.active);
	if (block) return recorded(config, payload, Focus.compact(ImplicitBoot.annotate(block, mission.boot), payload));
	const transactionPayload = {
		...payload,
		missionId: payload.missionId || mission.active?.missionId || payload.id || payload.target
	};
	return Transaction.run(config, transactionPayload, () =>
		executeMissionAction(config, payload, webSocket, mission)
	);
}

async function handleFsAction(rawPayload, webSocket) {
	const config = loadConfig();
	const payload = Payload.mergedPayload(rawPayload || {});
	if (!payload.normalized || !payload.action || payload.action === "unknown") {
		return recorded(config, payload, Recovery.missingActionEnvelope(rawPayload || payload));
	}
	return missionManaged(payload)
		? runMissionManaged(config, payload, webSocket)
		: runPlain(config, payload, webSocket);
}

function publicConfigWithVersion(config) {
	return publicConfig(config, AGENT_VERSION);
}

module.exports = {
	AGENT_VERSION,
	buildActions,
	handleFsAction,
	healthyActive: Runtime.healthyActive,
	isFirewallStepAuthorized,
	maybeOffload: Runtime.maybeOffload,
	missionManaged,
	prepareMission,
	publicConfig: publicConfigWithVersion,
	runMissionManaged,
	runPlain
};
