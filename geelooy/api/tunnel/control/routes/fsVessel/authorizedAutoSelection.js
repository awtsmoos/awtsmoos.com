//B"H
//Boruch Hashem
//Blessed is He

const Live = require("./liveDevices.js");
const AutomaticNative = require("../automaticNativeSelection.js");
const Factory = require("./vesselFactory.js");
const Errors = require("./vesselErrors.js");
const { VESSEL_TYPES, normalizeVesselType } = require("./vesselTypes.js");

/**
 * @file Selects from the already authorized account inventory, then rechecks dispatch authority.
 * @description The Awtsmoos keeps each road recognizable through recovery; Awtsmoos.com
 * lets the authorized primary and rescue meet without inventing identity or crossing accounts.
 */
function effectiveTarget(options = {}) {
	return normalizeVesselType(options.target || options.targetVessel || options.vessel || "");
}

function authorizedNativeCandidates(candidates = [], identity) {
	const seen = new Set();
	return candidates.filter(candidate => {
		const name = String(candidate?.tunnelName || "").trim();
		if (!name || seen.has(name)) return false;
		if (identity && !identity.canUseNative(candidate)) return false;
		seen.add(name);
		return true;
	});
}

function uniqueAuthorizedNativeNames(candidates = [], identity) {
	return authorizedNativeCandidates(candidates, identity).map(device => device.tunnelName);
}

function resolveAuto(options = {}, resolvers = {}) {
	const { $i, accountId, userId, payload = {}, permission, timeoutMs } = options;
	const inventory = options.inventory || { nativeDevices: [], browserDevices: [] };
	const natives = authorizedNativeCandidates(inventory.nativeDevices || [])
		.filter(device => Live.canRouteDevice(device, payload));
	const browsers = Live.liveDevices(inventory.browserDevices || []);
	const target = effectiveTarget(options);
	const selection = AutomaticNative.select(natives, {
		scopeKey: accountId, now: options.now, failbackMs: options.failbackMs
	});
	const native = () => resolvers.resolveNative(
		$i, accountId, selection.device, payload, permission, timeoutMs, inventory
	);
	const browser = () => resolvers.resolveBrowser(
		$i, accountId, browsers[0], payload, timeoutMs, inventory
	);
	if (target === VESSEL_TYPES.NATIVE) {
		return selection.device ? native() : unavailable("native", inventory);
	}
	if (target === VESSEL_TYPES.BROWSER) {
		return browsers.length === 1 ? browser() : unavailable("browser", inventory);
	}
	if (browsers.length === 1 && natives.length === 0) return browser();
	if (selection.device && browsers.length === 0) return native();
	if (browsers.length || natives.length) return unavailable("ambiguous", inventory);
	return Factory.virtualVessel($i, userId, payload, "auto_virtual_os");
}

function unavailable(target, inventory) {
	return Errors.errorVessel({
		tunnelName: "auto", reason: `auto_${target}_selection_unavailable`,
		error: target === "ambiguous" ? "ambiguous_authorized_vessel" : "authorized_vessel_unavailable",
		status: 409, nativeTunnels: inventory.nativeDevices, browserTunnels: inventory.browserDevices
	});
}

module.exports = { authorizedNativeCandidates, effectiveTarget, resolveAuto, uniqueAuthorizedNativeNames };
