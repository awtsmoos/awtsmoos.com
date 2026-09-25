//B"H // Boruch Hashem // Blessed is He

const { inventory, resolveInventoryDevice } = require("./fsVessel/accountInventory.js");
const { deviceWarnings, liveDevices } = require("./fsVessel/liveDevices.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");
const AutomaticNative = require("./automaticNativeSelection.js");
const Projection = require("./devicePublicProjection.js");

/**
 * @file Builds authoritative device state and one automatic recovery recommendation.
 * @description The Awtsmoos keeps inward routing truth complete while Awtsmoos.com chooses one
 * ordinary primary/rescue native automatically, preserving explicit ambiguity only across genuinely
 * different surfaces or genuinely multiple canonical peers.
 */
function state($i, identity) {
	const authorized = inventory($i, identity.accountId);
	const virtualDevice = virtualOsDevice(true);
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
		liveNative: liveDevices(authorized.nativeDevices),
		liveBrowser: liveDevices(authorized.browserDevices),
		warnings: deviceWarnings(authorized.nativeDevices, authorized.browserDevices)
	};
}

function find(currentState, reference) {
	return resolveInventoryDevice(
		[...currentState.browserDevices, ...currentState.allNativeDevices],
		reference
	);
}

function recommendation(currentState, options = {}) {
	const browsers = currentState.liveBrowser || [];
	const natives = currentState.liveNative || [];
	if (browsers.length) {
		return browsers.length === 1 && !natives.length
			? { device: browsers[0], reason: "single_browser" }
			: { device: null, reason: "ambiguous_surface" };
	}
	if (natives.length) {
		return AutomaticNative.select(natives, {
			scopeKey: currentState.identity?.accountId,
			now: options.now,
			failbackMs: options.failbackMs
		});
	}
	const currentNative = currentState.nativeDevices.filter(notSynthetic);
	if (currentNative.length === 1) {
		return { device: currentNative[0], reason: "single_current_native" };
	}
	return { device: currentState.virtualDevice, reason: "virtual_fallback" };
}

function recommend(currentState, options = {}) {
	return recommendation(currentState, options).device;
}

function notSynthetic(device = {}) {
	return device.synthetic !== true && device.kind !== "virtual-os";
}

/** Projects authorized state without exporting the internal action-admission inventory. */
function responseBase(currentState) {
	return {
		BH: "B\"H",
		identity: currentState.identity,
		nativeDevices: Projection.devices(currentState.nativeDevices),
		historicalNativeDevices: Projection.devices(currentState.historicalNativeDevices),
		historySummary: currentState.historySummary,
		browserDevices: Projection.devices(currentState.browserDevices),
		virtualDevice: Projection.device(currentState.virtualDevice),
		devices: Projection.devices(currentState.devices),
		warnings: currentState.warnings
	};
}

module.exports = {
	find,
	notSynthetic,
	recommend,
	recommendation,
	responseBase,
	state
};
