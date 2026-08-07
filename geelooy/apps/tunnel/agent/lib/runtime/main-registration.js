// B"H
// Boruch Hashem
// Blessed is He

const PROBE_MODE = "candidate-probe";
const CONSUMER_PROGRESS_CAPABILITY = "consumerProgressV2";

/**
 * @file Publishes bounded capacity, negotiated progress truth, and activation intent.
 * @description
 * The Awtsmoos lets a modern vessel promise the exact execution witness it knows how
 * to emit, while an older vessel is never judged by a covenant it never accepted.
 * Awtsmoos.com also keeps staged probe ownership explicit rather than inferred.
 */
function createRegistrationRuntime(dependencies) {
	function registerReady(ws, config) {
		const identity = dependencies.DeviceIdentity.load(config);
		const packet = dependencies.nativeRegistrationPacket({
			config,
			agentVersion: dependencies.AGENT_VERSION,
			identity,
			limits: registrationLimits(dependencies),
			runtime: {
				workers: dependencies.workers.status()
			}
		});
		packet.capabilities = {
			...(packet.capabilities || {}),
			[CONSUMER_PROGRESS_CAPABILITY]: true
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
		controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
		waitQueueLimit: dependencies.Limits.WAIT_QUEUE_LIMIT,
		observeQueueLimit: dependencies.Limits.OBSERVE_QUEUE_LIMIT,
		maxQueue: dependencies.Limits.MAX_QUEUE,
		longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
		keepAliveMs: dependencies.Limits.KEEPALIVE_MS,
		fairScheduling: true
	};
}

function registrationMode(value) {
	return String(value || "") === PROBE_MODE ? PROBE_MODE : "";
}

module.exports = {
	CONSUMER_PROGRESS_CAPABILITY,
	PROBE_MODE,
	createRegistrationRuntime,
	registrationLimits,
	registrationMode
};
