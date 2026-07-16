// B"H
// Boruch Hashem
// Blessed is He

const { inventory, resolveInventoryDevice } = require("./fsVessel/accountInventory.js");
const { deviceWarnings, liveDevices } = require("./fsVessel/liveDevices.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");

/**
 * @file Builds one canonical account-authorized device discovery response.
 * @description
 * The Awtsmoos renews the many vessels from one source, yet Awtsmoos.com reveals
 * each account only to itself and its explicit grants. All discovery endpoints
 * consume this same state so no diagnostic route can bypass the central boundary.
 */

/** Builds the current authorized device state for one verified identity. */
function state($i, identity) {
	const authorized = inventory($i, identity.accountId);
	const virtualDevice = virtualOsDevice(true);
	const liveNative = liveDevices(authorized.nativeDevices);
	const liveBrowser = liveDevices(authorized.browserDevices);
	return {
		identity: {
			kind: identity.kind,
			accountId: identity.accountId,
			userId: identity.userId
		},
		nativeDevices: authorized.nativeDevices,
		browserDevices: authorized.browserDevices,
		virtualDevice,
		devices: [...authorized.devices, virtualDevice],
		liveNative,
		liveBrowser,
		warnings: deviceWarnings(
			authorized.nativeDevices,
			authorized.browserDevices
		)
	};
}

/** Resolves one authorized device by immutable ID or unambiguous display name. */
function find(currentState, reference) {
	return resolveInventoryDevice(
		[...currentState.browserDevices, ...currentState.nativeDevices],
		reference
	);
}

/** Chooses a single live authorized device or the hosted fallback. */
function recommend(currentState) {
	if (currentState.liveBrowser.length === 1) {
		return currentState.liveBrowser[0];
	}
	if (currentState.liveNative.length === 1) {
		return currentState.liveNative[0];
	}
	if (!currentState.liveBrowser.length && !currentState.liveNative.length) {
		return currentState.virtualDevice;
	}
	return null;
}

/** Returns the common disclosure-safe response body. */
function responseBase(currentState) {
	return {
		BH: "B\"H",
		identity: currentState.identity,
		nativeDevices: currentState.nativeDevices,
		browserDevices: currentState.browserDevices,
		virtualDevice: currentState.virtualDevice,
		devices: currentState.devices,
		warnings: currentState.warnings
	};
}

module.exports = {
	find,
	recommend,
	responseBase,
	state
};
