//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Fs = require("../../tools/fs/index.js");
const AutoContinuation = require("../../tools/fs/mission/autoContinuation/index.js");
const ContinuationPool = require("../../tools/fs/mission/autoContinuation/poolMaintainer.js");
const ProjectRoots = require("../../tools/fs/mission/projectRootRegistry.js");
const LaunchRoot = require("./launch-root.js");

const DEFAULT_INTERVAL_MS = 30000;
const MIN_INTERVAL_MS = 15000;
const MAX_INTERVAL_MS = 300000;

/**
 * @file Supplies bounded policy and injectable dependencies for boot/resume continuation.
 * @description The Awtsmoos keeps one heartbeat small while Awtsmoos.com centralizes root,
 * interval, pool, and dependency policy in a separate inspectable vessel.
 */
function candidateProbe(env = process.env) {
	return String(env.AWTSMOOS_REGISTRATION_MODE || "") === "candidate-probe";
}

function enabled(env = process.env) {
	if (candidateProbe(env)) return false;
	return String(env.AWTSMOOS_MISSION_BOOT_RESUME || "") !== "0";
}

function autoMission(env = process.env) {
	return String(env.AWTSMOOS_AUTO_MISSION || "") === "1";
}

function interval(env = process.env) {
	const configured = Number(env.AWTSMOOS_MISSION_BOOT_RESUME_MS || DEFAULT_INTERVAL_MS);
	const value = Number.isFinite(configured) ? configured : DEFAULT_INTERVAL_MS;
	return Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, Math.floor(value)));
}

function usableBinding(config = {}, binding = null) {
	if (!binding?.projectRoot || !config.root) return binding;
	const authority = LaunchRoot.canonical(config.root);
	const historical = LaunchRoot.canonical(binding.projectRoot);
	if (historical === authority) return { ...binding, projectRoot: authority };
	return {
		...binding,
		projectRoot: authority,
		staleProjectRoot: binding.projectRoot,
		fallbackReason: fs.existsSync(binding.projectRoot)
			? "persisted_project_root_outside_authority"
			: "persisted_project_root_missing"
	};
}

function scopedConfig(config = {}, binding = null) {
	const root = binding?.projectRoot || config.root;
	return root ? { ...config, root } : { ...config };
}

function dependencies(options = {}) {
	return {
		handleFs: options.handleFs || Fs.handleFs,
		autoContinuation: options.autoContinuation || AutoContinuation,
		continuationPool: options.continuationPool || ContinuationPool,
		projectRoots: options.projectRoots || ProjectRoots
	};
}

function logResult(log, reason, continuation, pool, resume) {
	if (!continuation?.scheduled && !pool?.scheduled && !resume?.resumed && !resume?.autoStart?.started) return;
	log?.("Mission boot/continuation:", JSON.stringify({
		reason,
		continuationScheduled: Boolean(continuation?.scheduled),
		continuationReason: continuation?.reason || "",
		poolScheduled: Number(pool?.scheduled || 0),
		poolSize: Number(pool?.poolSize || 0),
		resumed: Boolean(resume?.resumed),
		mustCallNext: resume?.mustCallNext?.action || ""
	}));
}

const PROMOTION_LIFECYCLE = Object.freeze([
	"predecessor",
	"candidate",
	"promoted-owner",
	"predecessor-retired"
]);

const SUPERVISOR_ROLES = Object.freeze({
	CURRENT_OWNER: "current-owner",
	RETIRING_PREDECESSOR: "retiring-predecessor",
	CANDIDATE: "candidate",
	STALE_DUPLICATE: "stale-duplicate"
});

const CANDIDATE_REGISTRATION_MODE = "candidate-probe";

module.exports = {
	DEFAULT_INTERVAL_MS,
	MAX_INTERVAL_MS,
	MIN_INTERVAL_MS,
	PROMOTION_LIFECYCLE,
	SUPERVISOR_ROLES,
	assertExpectedSingleOwner,
	autoMission,
	candidateProbe,
	classifySupervisors,
	dependencies,
	enabled,
	finalizePredecessorRetirement,
	installerSupervisorBanner,
	interval,
	logPromotionOwnership,
	logResult,
	promotionAnomalyEvent,
	promotionOwnershipState,
	recordPromotionAnomaly,
	recordPromotionTransition,
	retiringPredecessorPid,
	scopedConfig,
	supervisorHealthVerdict,
	usableBinding
};

/**
 * @file (continued) Promotion ownership lifecycle and supervisor classification.
 * @description
 * Bug A: promotion once treated a stale connection vessel as routine cleanup.
 * The lifecycle is now explicit — predecessor → candidate → promoted-owner →
 * predecessor-retired — every transition is recorded in the recovery state, and
 * promotion asserts the expected single owner. A stale vessel observed at
 * promotion time is recorded as an anomaly, never as a routine step.
 *
 * Bug B: the installer once printed a bare supervisors=2 inside a
 * fully verified message. classifySupervisors enumerates every observed
 * supervisor process and labels each one; supervisorHealthVerdict only reports
 * healthy when the classification is clean — exactly one current-owner and
 * zero unexplained processes — and installerSupervisorBanner prints the
 * classification, never a bare count.
 */
/**
 * Ensures the recovery state carries a promotion ownership journal.
 * @param {object} [recoveryState] Durable recovery state shared by the installer and the runtime.
 * @returns {object} The promotionOwnership section of the recovery state.
 */
function promotionOwnershipState(recoveryState = {}) {
	if (!recoveryState.promotionOwnership || typeof recoveryState.promotionOwnership !== "object") {
		recoveryState.promotionOwnership = { current: null, currentOwnerPid: null, journal: [], anomalies: [] };
	}
	const state = recoveryState.promotionOwnership;
	if (!Array.isArray(state.journal)) state.journal = [];
	if (!Array.isArray(state.anomalies)) state.anomalies = [];
	return state;
}

/**
 * Shapes an anomaly for the installer event log.
 * @description Mirrors install_event(category, severity, message, detail): a stale
 * vessel at promotion time is severity anomaly, never a routine warning.
 * @param {object} [anomaly] Recorded anomaly entry.
 * @returns {{category: string, severity: string, message: string, detail: object}} Installer event record.
 */
function promotionAnomalyEvent(anomaly = {}) {
	return {
		category: "process",
		severity: "anomaly",
		message: anomaly.message || "Stale connection vessel observed during promotion.",
		detail: {
			kind: anomaly.kind || "promotion_anomaly",
			at: anomaly.at || null,
			expectedOwnerPid: anomaly.expectedOwnerPid ?? null,
			observedOwnerPids: anomaly.observedOwnerPids || [],
			pid: anomaly.pid ?? null,
			reason: anomaly.reason || ""
		}
	};
}

/**
 * Records a promotion anomaly in the recovery state.
 * @param {object} [recoveryState] Durable recovery state.
 * @param {object} [anomaly] Anomaly fields (kind, message, pids, reason).
 * @returns {{ok: false, anomaly: object, event: object, state: object}} The recorded anomaly and its installer event.
 */
function recordPromotionAnomaly(recoveryState = {}, anomaly = {}) {
	const state = promotionOwnershipState(recoveryState);
	const entry = {
		severity: "anomaly",
		at: new Date().toISOString(),
		kind: anomaly.kind || "promotion_anomaly",
		...anomaly
	};
	state.anomalies.push(entry);
	return { ok: false, anomaly: entry, event: promotionAnomalyEvent(entry), state };
}

/**
 * Records one ownership lifecycle transition in the recovery state.
 * @description Transitions must follow predecessor → candidate →
 * promoted-owner → predecessor-retired in order. Any out-of-order or unknown
 * transition is recorded as an anomaly and the journal is left untouched.
 * @param {object} [recoveryState] Durable recovery state.
 * @param {{from: string, to: string, pid?: number, replacedPid?: number, reason?: string}} [transition] The transition.
 * @returns {{ok: boolean, entry?: object, anomaly?: object, state: object}} The journal entry or the recorded anomaly.
 */
function recordPromotionTransition(recoveryState = {}, transition = {}) {
	const state = promotionOwnershipState(recoveryState);
	const { from = null, to = null, pid = null, replacedPid = null, reason = "" } = transition;
	const expectedFrom = state.journal.length === 0 ? PROMOTION_LIFECYCLE[0] : state.current;
	const expectedTo = PROMOTION_LIFECYCLE[PROMOTION_LIFECYCLE.indexOf(expectedFrom) + 1];
	if (!to || !PROMOTION_LIFECYCLE.includes(to)) {
		return recordPromotionAnomaly(recoveryState, {
			kind: "promotion_transition_invalid",
			expectedFrom, actualFrom: from, expectedTo, actualTo: to, pid, reason
		});
	}
	if (from !== expectedFrom || to !== expectedTo) {
		return recordPromotionAnomaly(recoveryState, {
			kind: "promotion_transition_out_of_order",
			expectedFrom, actualFrom: from, expectedTo, actualTo: to, pid, reason
		});
	}
	const entry = { at: new Date().toISOString(), from: expectedFrom, to, pid, replacedPid, reason };
	state.journal.push(entry);
	state.current = to;
	if (to === "promoted-owner") state.currentOwnerPid = pid;
	return { ok: true, entry, state };
}

/**
 * Asserts the expected single owner at promotion time.
 * @description A stale connection vessel observed here is an anomaly that gets
 * logged as such — it is never treated as a routine cleanup step.
 * @param {object} [recoveryState] Durable recovery state.
 * @param {{ownerPids?: number[], expectedOwnerPid?: number, reason?: string}} [observation] Observed owner pids vs expected.
 * @returns {{ok: boolean, ownerPid?: number, anomaly?: object, state?: object}} Assertion result.
 */
function assertExpectedSingleOwner(recoveryState = {}, observation = {}) {
	const ownerPids = (observation.ownerPids || []).map(Number).filter(Number.isFinite);
	const expected = observation.expectedOwnerPid == null ? null : Number(observation.expectedOwnerPid);
	if (expected != null && ownerPids.length === 1 && ownerPids[0] === expected) {
		return { ok: true, ownerPid: expected };
	}
	return recordPromotionAnomaly(recoveryState, {
		kind: "promotion_owner_violation",
		message: "Promotion observed an unexpected connection vessel owner set.",
		expectedOwnerPid: expected,
		observedOwnerPids: ownerPids,
		reason: observation.reason || ""
	});
}

/**
 * Records the final lifecycle transition once the predecessor is retired.
 * @param {object} [recoveryState] Durable recovery state.
 * @param {{predecessorPid?: number, reason?: string}} [detail] Retired predecessor details.
 * @returns {{ok: boolean, entry?: object, anomaly?: object, state: object}} The journal entry or the recorded anomaly.
 */
function finalizePredecessorRetirement(recoveryState = {}, detail = {}) {
	const state = promotionOwnershipState(recoveryState);
	if (state.current !== "promoted-owner") {
		return recordPromotionAnomaly(recoveryState, {
			kind: "predecessor_retirement_without_promotion",
			current: state.current,
			pid: detail.predecessorPid ?? null,
			reason: detail.reason || ""
		});
	}
	return recordPromotionTransition(recoveryState, {
		from: "promoted-owner",
		to: "predecessor-retired",
		pid: detail.predecessorPid ?? null,
		reason: detail.reason || "predecessor_retired_after_promotion"
	});
}

/**
 * Finds the predecessor pid still retiring, or null when fully retired.
 * @param {object[]} [journal] Promotion ownership journal.
 * @returns {number|null} The retiring predecessor pid.
 */
function retiringPredecessorPid(journal = []) {
	if (journal.some(entry => entry.to === "predecessor-retired")) return null;
	const promoted = [...journal].reverse().find(entry => entry.to === "promoted-owner");
	const pid = promoted?.replacedPid;
	return pid == null ? null : Number(pid);
}

/**
 * Enumerates and classifies every observed supervisor process.
 * @description Each process is labeled exactly one of current-owner,
 * retiring-predecessor, candidate, or stale-duplicate. Anything the journal
 * cannot explain is stale-duplicate.
 * @param {{pid: number, command?: string, registrationMode?: string}[]} [processTable] Observed supervisor processes.
 * @param {{expectedOwnerPid?: number, journal?: object[]}} [context] Expected owner pid and promotion journal.
 * @returns {{pid: number, command: string, role: string}[]} Classified supervisors.
 */
function classifySupervisors(processTable = [], context = {}) {
	const expectedOwnerPid = context.expectedOwnerPid == null ? null : Number(context.expectedOwnerPid);
	const retiring = retiringPredecessorPid(context.journal || []);
	return processTable.map(proc => {
		const pid = Number(proc?.pid);
		let role = SUPERVISOR_ROLES.STALE_DUPLICATE;
		if (expectedOwnerPid != null && pid === expectedOwnerPid) role = SUPERVISOR_ROLES.CURRENT_OWNER;
		else if (retiring != null && pid === retiring) role = SUPERVISOR_ROLES.RETIRING_PREDECESSOR;
		else if (String(proc?.registrationMode || "") === CANDIDATE_REGISTRATION_MODE) role = SUPERVISOR_ROLES.CANDIDATE;
		return { pid, command: String(proc?.command || ""), role };
	});
}

/**
 * Judges whether a supervisor classification is clean.
 * @description Healthy only when exactly one current-owner exists and zero
 * processes are unexplained. Retiring predecessors and candidates are
 * explained by the journal and registration mode, so they are allowed.
 * @param {{pid: number, command: string, role: string}[]} [classified] Classified supervisors.
 * @returns {{healthy: boolean, counts: object, reasons: string[]}} The verdict.
 */
function supervisorHealthVerdict(classified = []) {
	const counts = {
		[SUPERVISOR_ROLES.CURRENT_OWNER]: 0,
		[SUPERVISOR_ROLES.RETIRING_PREDECESSOR]: 0,
		[SUPERVISOR_ROLES.CANDIDATE]: 0,
		[SUPERVISOR_ROLES.STALE_DUPLICATE]: 0
	};
	for (const entry of classified) {
		if (counts[entry.role] !== undefined) counts[entry.role] += 1;
	}
	const reasons = [];
	if (counts[SUPERVISOR_ROLES.CURRENT_OWNER] !== 1) {
		reasons.push(`expected exactly one current-owner, found ${counts[SUPERVISOR_ROLES.CURRENT_OWNER]}`);
	}
	if (counts[SUPERVISOR_ROLES.STALE_DUPLICATE] > 0) {
		reasons.push(`${counts[SUPERVISOR_ROLES.STALE_DUPLICATE]} stale-duplicate supervisor(s) unexplained`);
	}
	return { healthy: reasons.length === 0, counts, reasons };
}

/**
 * Builds the installer health banner from the classification.
 * @description Shows every supervisor's role — never a bare count — so a
 * fully verified claim can only follow a clean classification.
 * @param {{pid: number, command: string, role: string}[]} [classified] Classified supervisors.
 * @param {{healthy: boolean, counts: object, reasons: string[]}} [verdict] Optional precomputed verdict.
 * @returns {string} The banner line.
 */
function installerSupervisorBanner(classified = [], verdict = supervisorHealthVerdict(classified)) {
	const listed = classified.map(entry => `${entry.role}:${entry.pid}`).join(" ");
	const reasons = verdict.reasons.length ? ` reasons="${verdict.reasons.join("; ")}"` : "";
	return `supervisors=[${listed}] verdict=${verdict.healthy ? "healthy" : "unhealthy"}${reasons}`;
}

/**
 * Logs the promotion ownership journal and any anomalies.
 * @param {Function} [log] Log sink.
 * @param {object} [recoveryState] Durable recovery state.
 */
function logPromotionOwnership(log, recoveryState = {}) {
	const state = promotionOwnershipState(recoveryState);
	if (state.journal.length === 0 && state.anomalies.length === 0) return;
	log?.("Promotion ownership:", JSON.stringify({
		current: state.current,
		currentOwnerPid: state.currentOwnerPid,
		journal: state.journal,
		anomalies: state.anomalies
	}));
}
