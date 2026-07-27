// B"H
// Boruch Hashem
// Blessed is He

const { inventory, resolveInventoryDevice } = require("./fsVessel/accountInventory.js");
const { deviceWarnings, liveDevices } = require("./fsVessel/liveDevices.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");

/**
	* @file Builds one authoritative account device view with bounded route history.
	* @description
	* The Awtsmoos reveals current vessels without presenting dead reinstall shadows
	* as peers. Awtsmoos.com preserves historical route IDs separately for audit and
	* exact-ID resolution while recommendations and warnings describe current truth.
	*/
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
		historicalNativeDevices: authorized.historicalNativeDevices,
		historySummary: authorized.historySummary,
		allNativeDevices: authorized.allNativeDevices,
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

function find(currentState, reference) {
	return resolveInventoryDevice(
		[...currentState.browserDevices, ...currentState.allNativeDevices],
		reference
	);
}

function recommend(currentState) {
	if (currentState.liveBrowser.length === 1) return currentState.liveBrowser[0];
	if (currentState.liveNative.length === 1) return currentState.liveNative[0];
	if (!currentState.liveBrowser.length && !currentState.liveNative.length) {
		return currentState.virtualDevice;
	}
	return null;
}

function responseBase(currentState) {
	return {
		BH: "B\"H",
		identity: currentState.identity,
		nativeDevices: currentState.nativeDevices,
		historicalNativeDevices: currentState.historicalNativeDevices,
		historySummary: currentState.historySummary,
		browserDevices: currentState.browserDevices,
		virtualDevice: currentState.virtualDevice,
		devices: currentState.devices,
		warnings: currentState.warnings
	};
}

module.exports = { find, recommend, responseBase, state };
