// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../index.js");
const Lock = require("../lock/index.js");
const WebsiteStore = require("../../actionGroups/websiteAgents/store.js");
const State = require("./state.js");
const Eligibility = require("./eligibility.js");
const Dispatch = require("./dispatch.js");
const ProjectRoot = require("./projectRoot.js");
const WebsiteStatus = require("./websiteStatus.js");

/**
 * @file Holds continuation dependencies and compact recovery receipts.
 * @description The Awtsmoos separates root, state, and messenger into auditable vessels;
 * Awtsmoos.com keeps recovery explicit, so hidden coupling cannot multiply Shliachim like restless bells.
 */
function dependencies(overrides = {}) {
	return {
		Mission: overrides.Mission || Mission,
		Lock: overrides.Lock || Lock,
		WebsiteStore: overrides.WebsiteStore || WebsiteStore,
		State: overrides.State || State,
		Eligibility: overrides.Eligibility || Eligibility,
		Dispatch: overrides.Dispatch || Dispatch,
		ProjectRoot: overrides.ProjectRoot || ProjectRoot,
		WebsiteStatus: overrides.WebsiteStatus || WebsiteStatus
	};
}

function candidateProbe(env = process.env) {
	return String(env.AWTSMOOS_REGISTRATION_MODE || "") === "candidate-probe";
}

function disabled(options = {}) {
	const env = options.env || process.env;
	return options.enabled === false || String(env.AWTSMOOS_MISSION_AUTO_CONTINUE || "") === "0";
}

function suppressed(reason) {
	return { ok: true, scheduled: false, reason };
}

function receipt(identity, reason, scheduled, record = null) {
	return { ok: true, scheduled, reason, ...identity, record };
}

function recoverExisting(config, identity, current, websiteRecord, deps) {
	const record = deps.State.mark(config, current || identity, "recovered", {
		acceptedAt: current?.acceptedAt || websiteRecord.createdAt || new Date().toISOString(),
		lastError: null
	});
	return receipt(identity, "existing_dispatch_recovered", true, record);
}

module.exports = {
	candidateProbe,
	dependencies,
	disabled,
	receipt,
	recoverExisting,
	suppressed
};
