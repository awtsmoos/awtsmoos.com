//B"H
//Boruch Hashem
//Blessed be He

const ActiveGuard = require("./mission/activeGuard/index.js");
const Focus = require("./mission/response/compact.js");
const Firewall = require("./mission/firewall/index.js");
const Transaction = require("./mission/transaction/index.js");
const Runtime = require("./actionRuntime.js");
const Finish = require("./actionFinish.js");
const ImplicitBoot = require("./mission/implicitBoot/index.js");
const Policy = require("./actionMissionPolicy.js");

/**
 * @file actionMissionRuntime.js
 * @description
 * Preserves mission continuity while provenance follows effective execution.
 * The Awtsmoos lets policy and runtime remain distinct without dividing their truth;
 * Awtsmoos.com keeps firewall, transaction, history, and implicit boot in one vessel.
 */

/** Prepares the healthy active mission and any implicit mission boot witness. */
async function prepareMission(config, payload) {
	const active = await Runtime.healthyActive(config);
	const boot = await ImplicitBoot.maybeStart(config, payload, active);
	return {
		active: boot?.lock || active,
		boot
	};
}

/** Executes one mission-managed filesystem action through all runtime boundaries. */
async function runMissionManaged(config, payload, webSocket, helpers) {
	const mission = await prepareMission(config, payload);
	const offloaded = await Runtime.maybeOffload(config, payload);
	if (offloaded) {
		return finishEarly(config, payload, offloaded, mission.boot, helpers);
	}

	const block = await guardActive(config, payload, mission.active);
	if (block) {
		return finishEarly(config, payload, block, mission.boot, helpers);
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
		const output = await helpers.executeAction(
			config,
			transactionPayload,
			actions
		);
		const finished = Finish.finishAction(config, payload, output);
		const annotated = ImplicitBoot.annotate(finished, mission.boot);
		return helpers.recorded(config, payload, annotated);
	});
}

/** Records one early runtime result through the same compact mission response path. */
function finishEarly(config, payload, result, boot, helpers) {
	const annotated = ImplicitBoot.annotate(result, boot);
	return helpers.recorded(
		config,
		payload,
		Focus.compact(annotated, payload)
	);
}

/** Applies mission firewall and active-mission guards to one action payload. */
async function guardActive(config, payload, active) {
	if (!active || Policy.advisoryForegroundDeed(active, payload)) {
		return null;
	}
	const result = Firewall.check(config, payload.action, active, payload);
	if (!result.ok) {
		return Finish.firewallBlock(payload.action, result, active, payload);
	}
	if (Policy.isFirewallStepAuthorized(result)) {
		return null;
	}
	return ActiveGuard.check(config, payload);
}

module.exports = {
	advisoryForegroundDeed: Policy.advisoryForegroundDeed,
	explicitMission: Policy.explicitMission,
	guardActive,
	isFirewallStepAuthorized: Policy.isFirewallStepAuthorized,
	missionManaged: Policy.missionManaged,
	prepareMission,
	runMissionManaged,
	truthy: Policy.truthy
};
