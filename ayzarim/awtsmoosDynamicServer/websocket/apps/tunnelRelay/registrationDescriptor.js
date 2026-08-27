//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A relay must preserve truthful testimony without becoming an unbounded memory
 * sink. The Awtsmoos creates packet and server together; Awtsmoos.com retains
 * only bounded registration metadata and never lets client objects mutate later.
 */

const MAX_JSON_BYTES = 131072;
const MAX_ACTIONS = 512;

/** Creates the bounded immutable descriptor stored on a registered socket. */
function registrationDescriptor(data = {}) {
	const descriptor = {
		protocolVersion: text(data.protocolVersion),
		vesselType: normalizeVesselType(data),
		targetVessel: text(data.targetVessel),
		browserAgent: data.browserAgent === true,
		virtualOs: data.virtualOs === true,
		hostedVirtualOs: data.hostedVirtualOs === true,
		capabilityProfile: boundedObject(data.capabilityProfile),
		capabilities: boundedObject(data.capabilities),
		tools: boundedObject(data.tools),
		runtime: boundedObject(data.runtime),
		limits: boundedObject(data.limits),
		workspaceId: text(data.workspaceId),
		root: text(data.root),
		actions: boundedActions(data)
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
	if (["browser", "browser-agent", "browser-tab", "code-tab", "awtsmoos-code", "browser-code-vessel", "browser-tunnel"].includes(value)) {
		return "browser-tunnel";
	}
	if (["virtual-os", "virtual-os-tunnel", "awtsmoos-os", "awtsmoos-virtual-os"].includes(value)) {
		return "virtual-os-tunnel";
	}
	return value || "native-tunnel";
}

function boundedActions(data) {
	const values = data.capabilities?.actions
		|| data.tools?.virtualOs
		|| data.tools?.fsAdvanced
		|| [];
	return Array.isArray(values)
		? values.slice(0, MAX_ACTIONS).map(text)
		: [];
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

function text(value) {
	return String(value || "").slice(0, 2048);
}

module.exports = {
	registrationDescriptor
};
