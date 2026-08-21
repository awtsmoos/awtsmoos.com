// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves bounded native v3 registration testimony through relay ingest.
 * @description
 * The Awtsmoos joins the packet that speaks with the server that remembers.
 * Awtsmoos.com keeps provenance, manifest hashes, and every bounded advertised action
 * visible so P0 recovery cannot be locked outside by a sanitizer that erased its name.
 */
const MAX_JSON_BYTES = 131072;
const MAX_ACTIONS = 2048;
const MAX_ACTION_NAME_BYTES = 160;

function registrationDescriptor(data = {}) {
	const supportedActions = boundedActions(data);
	const descriptor = {
		protocolVersion: text(data.protocolVersion),
		vesselType: normalizeVesselType(data),
		targetVessel: text(data.targetVessel),
		browserAgent: data.browserAgent === true,
		virtualOs: data.virtualOs === true,
		hostedVirtualOs: data.hostedVirtualOs === true,
		releaseSourceSha: hashText(data.releaseSourceSha, 40),
		actionManifestHash: hashText(data.actionManifestHash, 64),
		actionSchemaDigest: hashText(data.actionSchemaDigest, 64),
		supportedActions,
		actionManifest: boundedObject(data.actionManifest),
		capabilityProfile: boundedObject(data.capabilityProfile),
		capabilities: boundedObject(data.capabilities),
		tools: boundedObject(data.tools),
		runtime: boundedObject(data.runtime),
		limits: boundedObject(data.limits),
		workspaceId: text(data.workspaceId),
		root: text(data.root),
		actions: supportedActions
	};
	return Object.freeze(descriptor);
}

function normalizeVesselType(data) {
	if (data.virtualOs === true) {
		return "virtual-os-tunnel";
	}
	const value = text(
		data.vesselType
		|| data.targetVessel
		|| data.vessel
		|| data.kind
	).toLowerCase();
	if (["browser", "browser-agent", "browser-tab", "code-tab", "awtsmoos-code",
		"browser-code-vessel", "browser-tunnel"].includes(value)) {
		return "browser-tunnel";
	}
	if (["virtual-os", "virtual-os-tunnel", "awtsmoos-os", "awtsmoos-virtual-os"].includes(value)) {
		return "virtual-os-tunnel";
	}
	return value || "native-tunnel";
}

function boundedActions(data) {
	const values = data.supportedActions
		|| data.actions
		|| data.capabilities?.actions
		|| data.tools?.virtualOs
		|| data.tools?.fsAdvanced
		|| [];
	if (!Array.isArray(values)) {
		return Object.freeze([]);
	}
	const seen = new Set();
	const output = [];
	for (const candidate of values) {
		const action = text(candidate, MAX_ACTION_NAME_BYTES);
		if (!action || seen.has(action)) {
			continue;
		}
		seen.add(action);
		output.push(action);
		if (output.length >= MAX_ACTIONS) {
			break;
		}
	}
	return Object.freeze(output);
}

function boundedObject(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}
	try {
		const serialized = JSON.stringify(value);
		if (Buffer.byteLength(serialized) > MAX_JSON_BYTES) {
			return { truncated: true };
		}
		return JSON.parse(serialized);
	} catch {
		return {};
	}
}

function hashText(value, length) {
	const normalized = String(value || "").trim().toLowerCase();
	return new RegExp(`^[0-9a-f]{${length}}$`).test(normalized)
		? normalized
		: "";
}

function text(value, maximum = 2048) {
	return String(value || "").slice(0, maximum);
}

module.exports = {
	MAX_ACTIONS,
	boundedActions,
	registrationDescriptor
};
