// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./fsVessel/transientRoutePolicy.js");

/**
 * @file Machine-readable route-flap recovery covenant for external coordinators.
 * @description The Awtsmoos lets a road vanish from sight without teaching the messenger to bury it;
 * Awtsmoos.com binds rediscovery, backoff, capability truth, and exact-once replay into one law.
 */
function routeRecoveryBody() {
	return {
		retryableNativeErrors: ["tunnel_not_alive"],
		retryableControlStatuses: [502, 503, 504],
		retryScheduleMs: [...Recovery.RETRY_SCHEDULE_MS],
		rediscoverAction: "my-device",
		preserveImmutableRouteIdentity: true,
		reinstallOnSingleFailure: false,
		virtualOsCapabilityWarning: "Virtual OS is not equivalent to the native Mac for shell, command, browser, or local filesystem work.",
		acceptedMutationRule: "If device acceptance was proven, observe the existing receipt/job/history before replay. Never blind-replay an accepted mutation.",
		unacceptedReadCommandRule: "If acceptance was not proven and the deed is safe to retry, rediscover first and use bounded backoff.",
		steps: [
			"On retryable tunnel_not_alive, call my-device again before deciding the machine is offline.",
			"If the same native route appears in recoveringRoutes, preserve that route identity and retry with the published bounded schedule.",
			"Do not reinstall, mint a replacement tunnel, or abandon the mission from one transient liveness sample.",
			"If Virtual OS is selected while nativeRecoveryPending=true, verify that the requested deed is capability-compatible before using it.",
			"Treat control-plane 502/503/504 separately from native liveness; back off and rediscover rather than declaring the device dead."
		]
	};
}

module.exports = { routeRecoveryBody };
