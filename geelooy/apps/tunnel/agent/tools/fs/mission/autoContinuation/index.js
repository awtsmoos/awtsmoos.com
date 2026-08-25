// B"H
// Boruch Hashem
// Blessed is He

const GenerationalAdmission = require("./generationalAdmission.js");
const Helpers = require("./coordinatorHelpers.js");
const Identity = require("./coordinatorIdentity.js");
const Prompt = require("./prompt.js");
const RecoveryContext = require("./recoveryContext.js");
const TerminalDispatch = require("./terminalDispatch.js");
const SuccessorRecovery = require("../successorRecovery.js");
const Dispatch = require("./coordinatorDispatch.js");

/**
 * @file Coordinates continuation while giving saved terminal handoff the first right to recover.
 * @description
 * The Awtsmoos lets one unfinished flame pass through generations without splitting in two;
 * Awtsmoos.com first resumes a successor already durably chosen, then only when that covenant
 * is absent admits stale-agent recovery through the separately fenced generational doorway.
 */
async function run(config, options = {}) {
	if (Helpers.disabled(options)) {
		return Helpers.suppressed("auto_continuation_disabled");
	}
	if (Helpers.candidateProbe(options.env)) {
		return Helpers.suppressed("candidate_probe_suppressed");
	}
	const deps = Helpers.dependencies(options.deps);
	const lock = options.lock || deps.Lock.active(config);
	if (!lock?.missionId) {
		return Helpers.suppressed("no_active_mission");
	}
	const mission = options.mission || await deps.Mission.load(config, lock.missionId);
	if (!mission?.id) {
		return Helpers.suppressed("active_mission_missing");
	}
	const projectRoot = deps.ProjectRoot.resolve(config, mission, lock, options.binding);
	const scopedConfig = deps.ProjectRoot.scope(config, projectRoot);
	const fingerprint = Prompt.fingerprint(scopedConfig, mission, lock);
	const recovery = RecoveryContext.build(mission, fingerprint, {
		lock,
		now: options.now,
		inactivityMs: options.inactivityMs,
		planningFiles: Prompt.recentPlans(projectRoot)
	});
	const identity = Identity.build(mission, fingerprint, projectRoot, recovery);
	const terminal = await resumeTerminal(scopedConfig, mission, identity, options);
	if (terminal) {
		return terminal;
	}
	const blocked = Identity.reconcileActive(scopedConfig, identity, deps, Helpers);
	if (blocked) {
		return blocked;
	}
	const current = deps.State.read(scopedConfig, mission.id, fingerprint);
	const websiteRecord = deps.WebsiteStore.read(identity.websiteMissionId);
	const settled = TerminalDispatch.settle(
		scopedConfig,
		identity,
		current,
		websiteRecord,
		deps
	);
	if (settled) {
		return settled;
	}
	if (websiteRecord) {
		return Helpers.recoverExisting(scopedConfig, identity, current, websiteRecord, deps);
	}
	return GenerationalAdmission.admit(
		scopedConfig,
		options,
		deps,
		mission,
		lock,
		recovery,
		identity,
		current,
		Helpers
	);
}

async function resumeTerminal(config, mission, identity, options = {}) {
	const recovery = options.successorRecovery || SuccessorRecovery;
	const result = await recovery.resume(
		config,
		mission,
		options.successorRecoveryDeps || {}
	);
	if (!result?.handled) {
		return null;
	}
	return {
		...Helpers.receipt(identity, result.reason, result.scheduled, result.record),
		terminalSuccessorRecovery: true,
		recoveryOk: result.ok === true
	};
}

module.exports = {
	admitGenerational: GenerationalAdmission.admit,
	dispatchContinuation: Dispatch.dispatch,
	identityFor: Identity.build,
	reconcileActive: Identity.reconcileActive,
	resumeTerminal,
	run
};
