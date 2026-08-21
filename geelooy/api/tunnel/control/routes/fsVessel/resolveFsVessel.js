//B"H
// Boruch Hashem
// Blessed is He

const { inventory, resolveInventoryDevice } = require("./accountInventory.js");
const Selection = require("./authorizedSelection.js");
const Factory = require("./vesselFactory.js");
const Errors = require("./vesselErrors.js");
const { VESSEL_TYPES, normalizeVesselType } = require("./vesselTypes.js");
const BrowserPayload = require("../../core/tunnelPayload/browser.js");
const {
	hintsWantVirtualOs,
	isAutoTunnelName,
	isVirtualOsTunnelName
} = require("./virtualNames.js");

/**
 * @module ResolveFsVessel
 * @description
 * The Awtsmoos separates route kind from exact browser-tab identity before authorization begins;
 * Awtsmoos.com lets a Chrome target ID choose a leased page without masquerading as a vessel kin.
 */
function resolveFsVessel(options = {}) {
	const {
		$i,
		identity = {},
		userId = identity.userId,
		accountId = identity.accountId,
		tunnelName,
		payload = {},
		permission = "tunnel.read",
		timeoutMs
	} = options;
	const reference = String(tunnelName || "").trim();
	const target = requestedVesselType(reference, payload);
	if (target === VESSEL_TYPES.VIRTUAL_OS) {
		return Factory.virtualVessel($i, userId, payload, "explicit_virtual_os");
	}

	const authorizedInventory = inventory($i, accountId);
	if (isAutoTunnelName(reference)) {
		return Selection.resolveAuto({
			$i,
			accountId,
			userId,
			payload,
			permission,
			timeoutMs,
			target,
			inventory: authorizedInventory
		});
	}

	const device = resolveInventoryDevice(authorizedInventory.devices, reference);
	if (!device || incompatibleTarget(device, target, payload)) {
		return Errors.missing(reference);
	}
	return device.vesselType === VESSEL_TYPES.BROWSER
		? Selection.resolveBrowser(
			$i, accountId, device, payload, timeoutMs, authorizedInventory
		)
		: Selection.resolveNative(
			$i, accountId, device, payload, permission, timeoutMs, authorizedInventory
		);
}

function incompatibleTarget(device, target, payload = {}) {
	if (!target || device.vesselType === target) return false;
	return !nativeBrowserCompatibility(device, target, payload);
}

function nativeBrowserCompatibility(device, target, payload = {}) {
	return target === VESSEL_TYPES.BROWSER
		&& device.vesselType === VESSEL_TYPES.NATIVE
		&& device.capabilities?.browserControl === true
		&& BrowserPayload.isBrowserAction(payload.action);
}

/** Interprets route-kind hints but never mistakes an exact CDP target ID for a vessel type. */
function requestedVesselType(tunnelName, payload = {}) {
	if (BrowserPayload.isChromeTargetVessel(payload.targetVessel, payload.action)) {
		return "";
	}
	const explicit = normalizeVesselType(
		payload.targetVessel ||
		payload.vessel ||
		payload.fs ||
		payload.routeHints?.targetVessel
	);
	if (explicit) return explicit;
	if (isVirtualOsTunnelName(tunnelName)) return VESSEL_TYPES.VIRTUAL_OS;
	return isAutoTunnelName(tunnelName) && hintsWantVirtualOs(payload)
		? VESSEL_TYPES.VIRTUAL_OS
		: "";
}

module.exports = {
	incompatibleTarget,
	nativeBrowserCompatibility,
	requestedVesselType,
	resolveFsVessel,
	wantsVirtualOs(name, payload) {
		return requestedVesselType(name, payload) === VESSEL_TYPES.VIRTUAL_OS;
	}
};
