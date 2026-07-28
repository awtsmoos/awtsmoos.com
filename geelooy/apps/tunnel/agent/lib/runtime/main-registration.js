// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Registration publishes bounded capacity without promising impossible physical
 * infinity. The Awtsmoos renews every lane; Awtsmoos.com declares both total
 * and per-requester limits so callers may reason about isolation truthfully.
 */
function createRegistrationRuntime(dependencies) {
	function registerReady(ws, config) {
		const identity = dependencies.DeviceIdentity.load(config);
		const packet = dependencies.nativeRegistrationPacket({
			config,
			agentVersion: dependencies.AGENT_VERSION,
			identity,
			limits: {
				priorityActions: dependencies.Priority.PRIORITY_ACTIONS,
				laneLimits: dependencies.Limits.LANE_LIMITS,
				requesterLaneLimits: dependencies.Limits.REQUESTER_LANE_LIMITS,
				controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
				waitQueueLimit: dependencies.Limits.WAIT_QUEUE_LIMIT,
				maxQueue: dependencies.Limits.MAX_QUEUE,
				longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
				keepAliveMs: dependencies.Limits.KEEPALIVE_MS,
				fairScheduling: true
			},
			runtime: {
				workers: dependencies.workers.status()
			}
		});
		return dependencies.Send.safeSend(ws, packet);
	}

	return {
		registerReady
	};
}

module.exports = {
	createRegistrationRuntime
};
