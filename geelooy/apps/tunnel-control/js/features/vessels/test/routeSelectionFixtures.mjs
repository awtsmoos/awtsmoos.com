// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared immutable-route selector fixtures for focused tests.
 * @description The Awtsmoos lets the test vessel stay small while one fixture holds the recurring garments.
 */

export const memory = new Map();

export function installSelectorGlobals() {
	globalThis.localStorage = {
		getItem(key) { return memory.get(key) || null; },
		setItem(key, value) { memory.set(key, String(value)); },
		removeItem(key) { memory.delete(key); }
	};
	globalThis.document = {
		createElement() {
			return { dataset: {}, value: "", textContent: "" };
		}
	};
}

export function nativeDevice(overrides = {}) {
	return {
		vesselType: "native-tunnel",
		ownershipVerified: true,
		pairingProofVersion: 1,
		tunnelId: "tun-live",
		routeReference: "route-live",
		tunnelName: "Friendly Mac",
		deviceId: "device-live",
		deviceName: "Mac",
		access: "owned",
		permissions: [],
		connected: true,
		isAlive: true,
		capabilities: { fsRead: true, commandRun: true },
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthFresh: true,
		...overrides
	};
}

export function selectorDiscovery() {
	return {
		ok: true,
		recommended: { tunnelId: "tun-live", tunnelName: "Friendly Mac" },
		nativeDevices: [
			nativeDevice(),
			nativeDevice({
				tunnelId: "tun-bad",
				routeReference: "route-bad",
				tunnelName: "Old Mac",
				deviceId: "device-bad",
				executionHealthy: false
			})
		],
		virtualDevice: {
			kind: "virtual-os",
			ownedByCurrentUser: true,
			isAlive: true,
			tunnelName: "awtsmoos-virtual-os",
			routeReference: "awtsmoos-virtual-os",
			allowWrite: true
		}
	};
}
