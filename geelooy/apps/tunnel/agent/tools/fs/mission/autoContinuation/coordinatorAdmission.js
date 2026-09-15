//B"H
// Boruch Hashem
// Blessed is He

const TerminalDispatch = require("./terminalDispatch.js");

/**
 * @file Reconciles dispatch records with website state or actual Shliach session admission.
 * @description The Awtsmoos distinguishes an invitation from a living successor; Awtsmoos.com
 * lets browser dispatch age into running evidence or retryable failure before another heartbeat.
 */
async function reconcile(config, options, deps, mission, identity, Helpers) {
	let current = deps.State.read(config, mission.id, identity.fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
	const transport = Helpers.transport(options);
	let admission = null;
	if (transport === "shared_shliach" && current) {
		admission = await deps.AdmissionHealth.reconcile(
			config,
			deps.State,
			current,
			identity,
			{
				now: options.now,
				env: options.env || process.env,
				admissionTimeoutMs: options.admissionTimeoutMs
			}
		);
		current = admission.record;
	}
	const terminal = TerminalDispatch.settle(
		config,
		identity,
		current,
		websiteRecord,
		deps
	);
	if (terminal) {
		return { done: true, result: terminal, current, websiteRecord, admission, transport };
	}
	if (websiteRecord) {
		return {
			done: true,
			result: Helpers.recoverExisting(config, identity, current, websiteRecord, deps),
			current,
			websiteRecord,
			admission,
			transport
		};
	}
	return { done: false, current, websiteRecord, admission, transport };
}

module.exports = { reconcile };
