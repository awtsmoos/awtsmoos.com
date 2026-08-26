//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finite capability vocabulary for consent-gated device relationships.
 * @description
 * The Awtsmoos gives every created power its proper vessel; Awtsmoos.com names
 * only low-risk protocol deeds here, so a friendly message can never quietly
 * become filesystem, shell, browser, or command authority while worlds rhyme.
 */

const DEVICE_PROTOCOL_CAPABILITY = Object.freeze({
	PRESENCE_READ: "device.presence.read",
	MESSAGE_SEND: "device.message.send",
	EVENT_SEND: "device.event.send",
	REQUEST_SEND: "device.request.send"
});

const DEVICE_PROTOCOL_CAPABILITIES = Object.freeze(
	Object.values(DEVICE_PROTOCOL_CAPABILITY)
);
const KNOWN_CAPABILITIES = new Set(DEVICE_PROTOCOL_CAPABILITIES);

/** Returns unique known capability names without enlarging authority. */
function normalizeCapabilities(values = []) {
	if (!Array.isArray(values)) {
		return [];
	}
	return [...new Set(values.map(value => String(value || "").trim()))]
		.filter(value => KNOWN_CAPABILITIES.has(value));
}

/** Proves the submitted list is non-empty and contains no unknown authority. */
function validateCapabilities(values = []) {
	if (!Array.isArray(values) || values.length === 0) {
		return { ok: false, error: "device_protocol_capabilities_required" };
	}
	const capabilities = normalizeCapabilities(values);
	if (capabilities.length !== new Set(values.map(String)).size) {
		return { ok: false, error: "device_protocol_capability_invalid" };
	}
	return { ok: true, capabilities };
}

/** Returns true only when every accepted capability was originally requested. */
function isSubset(accepted = [], requested = []) {
	const allowed = new Set(normalizeCapabilities(requested));
	const reduced = normalizeCapabilities(accepted);
	return reduced.length > 0 && reduced.every(value => allowed.has(value));
}

/** Tests one capability against an active relationship projection. */
function includesCapability(relationship = {}, capability = "") {
	return normalizeCapabilities(relationship.capabilities).includes(capability);
}

module.exports = {
	DEVICE_PROTOCOL_CAPABILITIES,
	DEVICE_PROTOCOL_CAPABILITY,
	includesCapability,
	isSubset,
	normalizeCapabilities,
	validateCapabilities
};
