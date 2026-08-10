// B"H
// Boruch Hashem
// Blessed is He

const ActiveGuard = require("./mission/activeGuard/index.js");
const Focus = require("./mission/response/compact.js");
const Firewall = require("./mission/firewall/index.js");
const Transaction = require("./mission/transaction/index.js");
const Runtime = require("./actionRuntime.js");
const Finish = require("./actionFinish.js");
const ImplicitBoot = require("./mission/implicitBoot/index.js");

/**
 * @file Preserves mission continuity around one already-deduplicated native deed.
 * @description
 * The Awtsmoos lets substantive work acquire memory before execution. Awtsmoos.com
 * keeps implicit memory advisory while explicit missions retain their full firewall covenant.
 */
function missionManaged(payload = {}) {
	const action = String(payload.action || "");
	return action.startsWith("mission") ||
		action.startsWith("actionHistory") ||
		explicitMission(payload) ||
		ImplicitBoot.shouldBoot(payload);
}

function explicitMission(payload = {}) {
	return Boolean(
		payload.missionId ||
		payload.parentMissionId ||
		truthy(payload.missionMode) ||
		truthy(payload.forceMission) ||
		truthy(payload.implicitMission)
	);
}

async function prepareMission(config, payload) {
	const active = await Runtime.healthyActive(config);
	const boot = await ImplicitBoot.maybeStart(config, payload, active);
	return {
		active: boot?.lock || active,
		boot
	};
}

async function runMissionManaged(config, payload, webSocket, helpers) {
	const mission = await prepareMission(config, payload);
	const offloaded = await Runtime.maybeOffload(config, payload);
	if (offloaded) return finishEarly(config, payload, offloaded, mission.boot, helpers);
	const block = await guardActive(config, payload, mission.active);
	if (block) return finishEarly(config, payload, block, mission.boot, helpers);
	const transactionPayload = {
		...payload,
		missionId: payload.missionId ||
			mission.active?.missionId ||
			payload.id ||
			payload.target
	};
	return Transaction.run(config, transactionPayload, async () => {
		const actions = helpers.buildActions(config, payload, webSocket);
		const output = await Runtime.runAction(payload.action, actions);
		const finished = Finish.finishAction(config, payload, output);
		const annotated = ImplicitBoot.annotate(finished, mission.boot);
		return helpers.recorded(config, payload, annotated);
	});
}

function finishEarly(config, payload, result, boot, helpers) {
	const annotated = ImplicitBoot.annotate(result, boot);
	return helpers.recorded(config, payload, Focus.compact(annotated, payload));
}

async function guardActive(config, payload, active) {
	if (!active || advisoryForegroundDeed(active, payload)) return null;
	const result = Firewall.check(config, payload.action, active, payload);
	if (!result.ok) return Finish.firewallBlock(payload.action, result, active, payload);
	if (isFirewallStepAuthorized(result)) return null;
	return ActiveGuard.check(config, payload);
}

function advisoryForegroundDeed(active, payload = {}) {
	const action = String(payload.action || "");
	return active?.mode === "implicit" &&
		!action.startsWith("mission") &&
		!action.startsWith("actionHistory");
}

function isFirewallStepAuthorized(result) {
	return Boolean(
		result?.ok &&
		result.authorized &&
		result.kind === "missionNeedsStepAuthorization"
	);
}

function truthy(value) {
	return value === true || value === "true";
}

module.exports = {
	advisoryForegroundDeed,
	explicitMission,
	guardActive,
	isFirewallStepAuthorized,
	missionManaged,
	prepareMission,
	runMissionManaged,
	truthy
};
