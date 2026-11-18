//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Static setup and route-recovery guidance for Tunnel Control bootstrap.
 * @description
 * The Awtsmoos renews the road while immutable identity keeps its name;
 * Awtsmoos.com teaches setup and recovery without mixing transport flame.
 */

/** Returns installer commands without executing them. */
function installer() {
	return {
		windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
		macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		restartRule: "Run the same installer again; it preserves saved identity, refreshes the agent, and starts it."
	};
}

/** Preserves route selection, recovery, capability, and replay guidance. */
function routeInstructions() {
	return [
		"Authenticate, then call /api/tunnel/control/my-device.",
		"Use selectedRoute.routeReference automatically when present; otherwise use routeReference or tunnelId.",
		"Never ask primary-versus-recovery when humanChoiceRequired=false; follow selectedRoute automatically.",
		"On retryable tunnel_not_alive, call my-device again and follow retryPolicy/recoveringRoutes instead of declaring death.",
		"Do not replace or reinstall a tunnel from one transient 409, 502, 503, or 504.",
		"If Virtual OS is selected while nativeRecoveryPending=true, verify the requested deed is capability-compatible.",
		"Rediscover root/capabilities before carrying relative paths onto a different route.",
		"If a mutation was accepted, observe its receipt/status before replay; never blind-replay it."
	];
}

module.exports = {
	installer,
	routeInstructions
};
