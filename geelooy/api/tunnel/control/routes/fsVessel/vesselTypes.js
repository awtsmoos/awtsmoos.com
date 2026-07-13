//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Every adapter receives one canonical vessel name before routing begins. The
 * Awtsmoos is one beyond all surfaces; Awtsmoos.com keeps legacy aliases at the
 * boundary so native, browser, virtual, and hosted vessels remain distinct.
 */
const VESSEL_TYPES = Object.freeze({
	NATIVE: "native-tunnel",
	BROWSER: "browser-tunnel",
	VIRTUAL_OS: "virtual-os-tunnel",
	HOSTED_VIRTUAL_OS: "hosted-virtual-os",
	MISSING: "missing-tunnel"
});

const NATIVE_ALIASES = Object.freeze([
	"native",
	"native-local",
	"native-tunnel",
	"local",
	"local-tunnel"
]);
const BROWSER_ALIASES = Object.freeze([
	"apps-code",
	"awtsmoos-code",
	"browser",
	"browser-agent",
	"browser-code-vessel",
	"browser-tab",
	"browser-tunnel",
	"code-tab",
	"tab"
]);
const VIRTUAL_ALIASES = Object.freeze([
	"awtsmoos-os",
	"awtsmoos-virtual-os",
	"virtual",
	"virtual-os",
	"virtual-os-tunnel"
]);

function normalizeVesselType(value = "") {
	const text = String(value || "").trim().toLowerCase();

	if (NATIVE_ALIASES.includes(text)) {
		return VESSEL_TYPES.NATIVE;
	}
	if (BROWSER_ALIASES.includes(text)) {
		return VESSEL_TYPES.BROWSER;
	}
	if (VIRTUAL_ALIASES.includes(text)) {
		return VESSEL_TYPES.VIRTUAL_OS;
	}
	if (["hosted", "hosted-virtual-os"].includes(text)) {
		return VESSEL_TYPES.HOSTED_VIRTUAL_OS;
	}
	return text;
}

function inferVesselType(client = {}) {
	if (client.virtualOs === true || client.capabilities?.virtualOs === true) {
		return VESSEL_TYPES.VIRTUAL_OS;
	}
	if (client.hostedVirtualOs === true) {
		return VESSEL_TYPES.HOSTED_VIRTUAL_OS;
	}
	if (isBrowserVesselDescriptor(client)) {
		return VESSEL_TYPES.BROWSER;
	}
	return VESSEL_TYPES.NATIVE;
}

function vesselTypeFor(client = {}) {
	return normalizeVesselType(
		client.vesselType || client.targetVessel || client.kind || client.type
	) || inferVesselType(client);
}

function isBrowserVesselDescriptor(client = {}) {
	const declaredType = normalizeVesselType(
		client.vesselType || client.kind || client.type
	);

	return declaredType === VESSEL_TYPES.BROWSER
		|| client.browserAgent === true
		|| client.capabilities?.browserTab === true
		|| client.tools?.browserTab === true;
}

function isBrowserAgent(client = {}) {
	return isBrowserVesselDescriptor(client);
}

function isVirtualOs(client = {}) {
	return [VESSEL_TYPES.VIRTUAL_OS, VESSEL_TYPES.HOSTED_VIRTUAL_OS]
		.includes(vesselTypeFor(client));
}

module.exports = {
	VESSEL_TYPES,
	inferVesselType,
	isBrowserAgent,
	isBrowserVesselDescriptor,
	isVirtualOs,
	normalizeVesselType,
	vesselTypeFor
};
