// B"H
// Boruch Hashem
// Blessed is He

const PROBE_MODE = "candidate-probe";
const CONSUMER_PROGRESS_CAPABILITY = "consumerProgressV2";
const REQUESTER_QUEUE_CAPABILITY = "requesterQueueIsolationV1";
const SCHEDULER_RECOVERY_CAPABILITY = "schedulerRecoveryV2";
const EXACT_CUSTODY_CAPABILITY = "exactCustodyLeasesV1";
const ACTION_MANIFEST_CAPABILITY = "actionManifestV1";
const RECOVERY_CONTROL_CAPABILITY = "recoveryControlV1";

/**
 * @file Publishes bounded capacity plus exact recovery and provenance negotiation.
 * @description
 * The Awtsmoos lets many shluchim arrive while Awtsmoos.com tells the relay the
 * precise covenant: fair queues, exact custody, direct bounded recovery, and executable
 * action provenance are negotiated instead of inferred from a socket or display name.
 */
function createRegistrationRuntime(dependencies) {
	function registerReady(ws, config) {
		const identity = dependencies.DeviceIdentity.load(config);
		const packet = dependencies.nativeRegistrationPacket({
			config,
			agentVersion: dependencies.AGENT_VERSION,
			identity,
			limits: registrationLimits(dependencies),
			runtime: { workers: dependencies.workers.status() }
		});
		packet.capabilities = {
			...(packet.capabilities || {}),
			[CONSUMER_PROGRESS_CAPABILITY]: true,
			[REQUESTER_QUEUE_CAPABILITY]: true,
			[SCHEDULER_RECOVERY_CAPABILITY]: true,
			[EXACT_CUSTODY_CAPABILITY]: true,
			[ACTION_MANIFEST_CAPABILITY]: true,
			[RECOVERY_CONTROL_CAPABILITY]: true
		};
		const mode = registrationMode(process.env.AWTSMOOS_REGISTRATION_MODE);
		if (mode) packet.registrationMode = mode;
		return dependencies.Send.safeSend(ws, packet);
	}
	return { registerReady };
}

function registrationLimits(dependencies) {
	return {
		priorityActions: dependencies.Priority.PRIORITY_ACTIONS,
		laneLimits: dependencies.Limits.LANE_LIMITS,
		requesterLaneLimits: dependencies.Limits.REQUESTER_LANE_LIMITS,
		requesterQueueLimits: dependencies.Limits.REQUESTER_QUEUE_LIMITS,
		controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
		waitQueueLimit: dependencies.Limits.WAIT_QUEUE_LIMIT,
		observeQueueLimit: dependencies.Limits.OBSERVE_QUEUE_LIMIT,
		maxQueue: dependencies.Limits.MAX_QUEUE,
		longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
		keepAliveMs: dependencies.Limits.KEEPALIVE_MS,
		fairScheduling: true,
		requesterQueueIsolation: true
	};
}

function registrationMode(value) {
	return String(value || "") === PROBE_MODE ? PROBE_MODE : "";
}

module.exports = {
	ACTION_MANIFEST_CAPABILITY,
	CONSUMER_PROGRESS_CAPABILITY,
	EXACT_CUSTODY_CAPABILITY,
	PROBE_MODE,
	RECOVERY_CONTROL_CAPABILITY,
	REQUESTER_QUEUE_CAPABILITY,
	SCHEDULER_RECOVERY_CAPABILITY,
	createRegistrationRuntime,
	promoteCandidateOwnership,
	registrationLimits,
	registrationMode
};

/**
 * @file (continued) Candidate promotion with explicit handoff ownership.
 * @description
 * Promotion once treated a stale connection vessel as routine cleanup.
 * promoteCandidateOwnership models the handoff as predecessor → candidate →
 * promoted-owner: every transition is recorded in the recovery state, the
 * promotion asserts the expected single owner, and a stale vessel observed at
 * promotion time is recorded as an anomaly — never a routine cleanup step.
 * The installer calls finalizePredecessorRetirement once the old owner is gone.
 * @param {object} [recoveryState] Durable recovery state shared by the installer and the runtime.
 * @param {{candidatePid?: number, predecessorPid?: number, observedOwnerPids?: number[], reason?: string}} [promotion] Promotion facts.
 * @returns {{ok: boolean, ownerPid?: number, alreadyPromoted?: boolean, entry?: object, anomaly?: object, state?: object}} Promotion result.
 */
function promoteCandidateOwnership(recoveryState = {}, promotion = {}) {
	const Policy = require("./boot-resume-policy.js");
	const candidatePid = promotion.candidatePid == null ? null : Number(promotion.candidatePid);
	const predecessorPid = promotion.predecessorPid == null ? null : Number(promotion.predecessorPid);
	const reason = promotion.reason || "candidate_promotion";
	const state = Policy.promotionOwnershipState(recoveryState);
	if (state.current === "promoted-owner") {
		if (state.currentOwnerPid === candidatePid) {
			return { ok: true, ownerPid: candidatePid, alreadyPromoted: true, state };
		}
		return Policy.recordPromotionAnomaly(recoveryState, {
			kind: "promotion_double_promotion",
			message: "Promotion attempted while another owner holds the slot.",
			expectedOwnerPid: state.currentOwnerPid,
			observedOwnerPids: [candidatePid],
			reason
		});
	}
	if (state.journal.length === 0) {
		const first = Policy.recordPromotionTransition(recoveryState, {
			from: "predecessor",
			to: "candidate",
			pid: candidatePid,
			replacedPid: predecessorPid,
			reason: "candidate_registered"
		});
		if (!first.ok) return first;
	}
	const assertion = Policy.assertExpectedSingleOwner(recoveryState, {
		ownerPids: promotion.observedOwnerPids || [],
		expectedOwnerPid: candidatePid,
		reason
	});
	if (!assertion.ok) return assertion;
	const promoted = Policy.recordPromotionTransition(recoveryState, {
		from: "candidate",
		to: "promoted-owner",
		pid: candidatePid,
		replacedPid: predecessorPid,
		reason
	});
	if (!promoted.ok) return promoted;
	return { ok: true, ownerPid: candidatePid, entry: promoted.entry, state: promoted.state };
}
