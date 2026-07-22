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
 * @file Preserves mission policy around one already-deduplicated native deed.
 * @description
 * The Awtsmoos keeps firewall, boot, transaction, and compact response in their
 * own vessel. Awtsmoos.com lets the outer dispatcher reserve identity first,
 * while mission truth continues unchanged inside that canonical execution.
 */
function missionManaged(payload = {}) {
	const action = String(payload.action || "");
	return action.startsWith("mission") ||
		action.startsWith("actionHistory") ||
		Boolean(
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
	if (offloaded) {
		const annotated = ImplicitBoot.annotate(offloaded, mission.boot);
		return helpers.recorded(
			config,
			payload,
			Focus.compact(annotated, payload)
		);
	}
	const block = await guardActive(config, payload, mission.active);
	if (block) {
		const annotated = ImplicitBoot.annotate(block, mission.boot);
		return helpers.recorded(
			config,
			payload,
			Focus.compact(annotated, payload)
		);
	}
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

async function guardActive(config, payload, active) {
	if (!active) return null;
	const result = Firewall.check(config, payload.action, active, payload);
	if (!result.ok) {
		return Finish.firewallBlock(payload.action, result, active, payload);
	}
	if (isFirewallStepAuthorized(result)) return null;
	return ActiveGuard.check(config, payload);
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
	guardActive,
	isFirewallStepAuthorized,
	missionManaged,
	prepareMission,
	runMissionManaged,
	truthy
};
