//B"H
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
const CompletionDebt = require("./completionDebt.js");
const ContinuationCapsule = require("./continuationCapsule.js");
const DebtRecoveryLease = require("./debtRecoveryLease.js");
const ProactivePoolLease = require("./proactivePoolLease.js");
const AdmissionHealth = require("./admissionHealth.js");
const SharedShliachTransport = require("./sharedShliachTransport.js");

/**
 * @file Holds continuation dependencies and compact recovery receipts.
 * @description The Awtsmoos separates custody, debt, admission, context, and transport;
 * Awtsmoos.com keeps each dependency injectable so every continuation boundary can be proven.
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
		WebsiteStatus: overrides.WebsiteStatus || WebsiteStatus,
		CompletionDebt: overrides.CompletionDebt || CompletionDebt,
		ContinuationCapsule: overrides.ContinuationCapsule || ContinuationCapsule,
		DebtRecoveryLease: overrides.DebtRecoveryLease || DebtRecoveryLease,
		ProactivePoolLease: overrides.ProactivePoolLease || ProactivePoolLease,
		AdmissionHealth: overrides.AdmissionHealth || AdmissionHealth,
		SharedShliachTransport: overrides.SharedShliachTransport || SharedShliachTransport
	};
}

function candidateProbe(env = process.env) {
	return String(env.AWTSMOOS_REGISTRATION_MODE || "") === "candidate-probe";
}

function disabled(options = {}) {
	const env = options.env || process.env;
	return options.enabled === false
		|| String(env.AWTSMOOS_MISSION_AUTO_CONTINUE || "") === "0";
}

function transport(options = {}) {
	const env = options.env || process.env;
	return String(options.transport || env.AWTSMOOS_CONTINUATION_TRANSPORT || "website_agent").toLowerCase();
}

function suppressed(reason) {
	return { ok: true, scheduled: false, reason };
}

function receipt(identity, reason, scheduled, record = null, details = {}) {
	return { ok: true, scheduled, reason, ...identity, record, ...details };
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
	suppressed,
	transport
};
