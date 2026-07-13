//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Four vessels carry one intention without pretending to be interchangeable.
 * The Awtsmoos recreates machine, browser, virtual desktop, and hosted fallback;
 * Awtsmoos.com names each truthfully so routing never mistakes image for source.
 */

export const VESSEL_TYPES = Object.freeze({
	NATIVE: "native-tunnel",
	BROWSER: "browser-tunnel",
	VIRTUAL_OS: "virtual-os-tunnel",
	HOSTED_VIRTUAL_OS: "hosted-virtual-os",
	MISSING: "missing-tunnel"
});

const TYPE_ALIASES = Object.freeze({
	"native": VESSEL_TYPES.NATIVE,
	"native-tunnel": VESSEL_TYPES.NATIVE,
	"local": VESSEL_TYPES.NATIVE,
	"local-tunnel": VESSEL_TYPES.NATIVE,
	"browser": VESSEL_TYPES.BROWSER,
	"browser-agent": VESSEL_TYPES.BROWSER,
	"browser-tab": VESSEL_TYPES.BROWSER,
	"browser-tunnel": VESSEL_TYPES.BROWSER,
	"tab": VESSEL_TYPES.BROWSER,
	"code-tab": VESSEL_TYPES.BROWSER,
	"apps-code": VESSEL_TYPES.BROWSER,
	"awtsmoos-code": VESSEL_TYPES.BROWSER,
	"browser-code-vessel": VESSEL_TYPES.BROWSER,
	"virtual": VESSEL_TYPES.VIRTUAL_OS,
	"virtual-os": VESSEL_TYPES.VIRTUAL_OS,
	"virtual-os-tunnel": VESSEL_TYPES.VIRTUAL_OS,
	"awtsmoos-os": VESSEL_TYPES.VIRTUAL_OS,
	"awtsmoos-virtual-os": VESSEL_TYPES.VIRTUAL_OS,
	"hosted": VESSEL_TYPES.HOSTED_VIRTUAL_OS,
	"hosted-virtual-os": VESSEL_TYPES.HOSTED_VIRTUAL_OS,
	"missing": VESSEL_TYPES.MISSING,
	"missing-tunnel": VESSEL_TYPES.MISSING
});

/** Normalizes all historic aliases into one canonical vessel type. */
export function normalizeVesselType(value = "") {
	const text = String(value || "").trim().toLowerCase();
	return TYPE_ALIASES[text] || text;
}

/** Infers virtual OS before browser flags so connected desktops stay truthful. */
export function inferVesselType(device = {}) {
	if (device.virtualOs === true || device.capabilities?.virtualOs === true) {
		return VESSEL_TYPES.VIRTUAL_OS;
	}
	if (device.hostedVirtualOs === true) {
		return VESSEL_TYPES.HOSTED_VIRTUAL_OS;
	}
	if (device.browserAgent === true
		|| device.capabilities?.browserTab === true
		|| device.tools?.browserTab === true) {
		return VESSEL_TYPES.BROWSER;
	}
	return VESSEL_TYPES.NATIVE;
}

/** Returns the canonical type declared or safely inferred by a descriptor. */
export function vesselTypeFor(device = {}) {
	return normalizeVesselType(
		device.vesselType
		|| device.targetVessel
		|| device.kind
		|| device.type
	) || inferVesselType(device);
}

export function isBrowserVesselDescriptor(device = {}) {
	return vesselTypeFor(device) === VESSEL_TYPES.BROWSER;
}
