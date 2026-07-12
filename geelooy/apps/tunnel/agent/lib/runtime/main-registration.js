// B"H

/** B"H — Registration publishes bounded capacity and the current worker census. */
function createRegistrationRuntime(dependencies) {
	function registerReady(ws, config) {
		const packet = dependencies.nativeRegistrationPacket({
			config,
			agentVersion: dependencies.AGENT_VERSION,
			limits: {
				priorityActions: dependencies.Priority.PRIORITY_ACTIONS,
				laneLimits: dependencies.Limits.LANE_LIMITS,
				controlQueueLimit: dependencies.Limits.CONTROL_QUEUE_LIMIT,
				maxQueue: dependencies.Limits.MAX_QUEUE,
				longLivedConnections: dependencies.Limits.LONG_LIVED_CONNECTIONS,
				keepAliveMs: dependencies.Limits.KEEPALIVE_MS
			},
			runtime: {
				workers: dependencies.workers.status()
			}
		});
		return dependencies.Send.safeSend(ws, packet);
	}

	return { registerReady };
}

module.exports = { createRegistrationRuntime };
