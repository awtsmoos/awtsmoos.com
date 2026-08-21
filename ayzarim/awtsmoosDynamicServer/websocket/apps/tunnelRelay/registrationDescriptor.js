// B"H
// Boruch Hashem
// Blessed is He

const Bounds = require("./registrationDescriptorBounds.js");

/**
 * @file Preserves compact public capability truth beside the complete internal manifest.
 * @description
 * The Awtsmoos joins a small outward covenant with every exact inner deed. Awtsmoos.com
 * remembers fourteen public doors, immutable provenance, and the grouped executable
 * testimony so recovery remains reachable and rolling upgrades remain trustworthy.
 */
function registrationDescriptor(data = {}) {
	const supportedActions = Bounds.boundedActions(data);
	return Object.freeze({
		protocolVersion: Bounds.text(data.protocolVersion),
		vesselType: normalizeVesselType(data),
		targetVessel: Bounds.text(data.targetVessel),
		browserAgent: data.browserAgent === true,
		virtualOs: data.virtualOs === true,
		hostedVirtualOs: data.hostedVirtualOs === true,
		releaseSourceSha: Bounds.hashText(data.releaseSourceSha, 40),
		actionManifestHash: Bounds.hashText(data.actionManifestHash, 64),
		actionSchemaDigest: Bounds.hashText(data.actionSchemaDigest, 64),
		publicActionDigest: Bounds.hashText(data.publicActionDigest, 64),
		publicActionCount: Bounds.boundedInteger(
			data.publicActionCount || supportedActions.length,
			Bounds.MAX_ACTIONS
		),
		supportedActions,
		actionManifest: Bounds.boundedObject(data.actionManifest),
		capabilityProfile: Bounds.boundedObject(data.capabilityProfile),
		capabilities: Bounds.boundedObject(data.capabilities),
		tools: Bounds.boundedObject(data.tools),
		runtime: Bounds.boundedObject(data.runtime),
		limits: Bounds.boundedObject(data.limits),
		workspaceId: Bounds.text(data.workspaceId),
		root: Bounds.text(data.root),
		actions: supportedActions
	});
}

function normalizeVesselType(data) {
	if (data.virtualOs === true) return "virtual-os-tunnel";
	const value = Bounds.text(
		data.vesselType
		|| data.targetVessel
		|| data.vessel
		|| data.kind
	).toLowerCase();
	if (browserTypes().has(value)) return "browser-tunnel";
	if (virtualTypes().has(value)) return "virtual-os-tunnel";
	return value || "native-tunnel";
}

function browserTypes() {
	return new Set([
		"browser",
		"browser-agent",
		"browser-tab",
		"code-tab",
		"awtsmoos-code",
		"browser-code-vessel",
		"browser-tunnel"
	]);
}

function virtualTypes() {
	return new Set([
		"virtual-os",
		"virtual-os-tunnel",
		"awtsmoos-os",
		"awtsmoos-virtual-os"
	]);
}

module.exports = {
	MAX_ACTIONS: Bounds.MAX_ACTIONS,
	boundedActions: Bounds.boundedActions,
	registrationDescriptor
};
