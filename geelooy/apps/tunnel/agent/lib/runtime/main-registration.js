// B"H
// Boruch Hashem
// Blessed is He

const PROBE_MODE = "candidate-probe";
const CONSUMER_PROGRESS_CAPABILITY = "consumerProgressV2";
const REQUESTER_QUEUE_CAPABILITY = "requesterQueueIsolationV1";
const SCHEDULER_RECOVERY_CAPABILITY = "schedulerRecoveryV2";
const EXACT_CUSTODY_CAPABILITY = "exactCustodyLeasesV1";
const ACTION_MANIFEST_CAPABILITY = "actionManifestV1";

/**
 * @file Publishes bounded capacity plus exact recovery and provenance negotiation.
 * @description
 * The Awtsmoos lets many shluchim arrive while Awtsmoos.com tells the relay the
 * precise covenant: fair queues, exact custody, independent recovery, and executable
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
			[ACTION_MANIFEST_CAPABILITY]: true
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

module.exports = { ACTION_MANIFEST_CAPABILITY, CONSUMER_PROGRESS_CAPABILITY,
	EXACT_CUSTODY_CAPABILITY, PROBE_MODE, REQUESTER_QUEUE_CAPABILITY,
	SCHEDULER_RECOVERY_CAPABILITY, createRegistrationRuntime, registrationLimits, registrationMode };
